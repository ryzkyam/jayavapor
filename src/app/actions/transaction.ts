// src/app/actions/transaction.ts
'use server'

import { supabase } from "../../../lib/supabase";

interface ItemInput {
  productId: string;
  quantity: number;
}

export async function processTransaction(customerId: string, items: ItemInput[], discount = 0) {
  let totalAmount = 0;
  const itemsData = [];

  // 1. Ambil data produk untuk hitung harga & cek stok
  for (const item of items) {
    const { data: product, error: pError } = await supabase
      .from('Product')
      .select('*')
      .eq('id', item.productId)
      .single();

    if (pError || !product) throw new Error(`Produk ID ${item.productId} gak ada, bro.`);
    if (product.stock < item.quantity) throw new Error(`Stok ${product.name} abis.`);

    // Kurangi stok produk
    await supabase
      .from('Product')
      .update({ stock: product.stock - item.quantity })
      .eq('id', product.id);

    const totalPrice = product.price * item.quantity;
    totalAmount += totalPrice;

    itemsData.push({
      productId: product.id,
      quantity: item.quantity,
      priceAtSale: product.price,
      totalPrice: totalPrice
    });
  }

  const finalAmount = totalAmount - discount;
  const pointsEarned = Math.floor(finalAmount / 10000); // Rp 10.000 = 1 Poin

  // 2. Insert ke tabel Transaction
  const { data: transaction, error: tError } = await supabase
    .from('Transaction')
    .insert([{ customerId, totalAmount, discount, finalAmount, pointsEarned }])
    .select()
    .single();

  if (tError) throw new Error("Gagal input transaksi: " + tError.message);

  // 3. Insert Detail Item Transaksi (TransactionItem)
  const itemsWithTxId = itemsData.map(item => ({ ...item, transactionId: transaction.id }));
  await supabase.from('TransactionItem').insert(itemsWithTxId);

  // 4. Ambil data customer saat ini untuk kalkulasi poin & tier
  const { data: customer } = await supabase
    .from('Customer')
    .select('points, tier')
    .eq('id', customerId)
    .single();

  const currentPoints = (customer?.points || 0) + pointsEarned;

  // Aturan Evaluasi Tier Membership
  let updatedTier = 'BRONZE';
  if (currentPoints >= 500) updatedTier = 'GOLD';
  else if (currentPoints >= 200) updatedTier = 'SILVER';

  // 5. Update Poin & Tier di tabel Customer
  await supabase
    .from('Customer')
    .update({ points: currentPoints, tier: updatedTier })
    .eq('id', customerId);

  // 6. Catat Log Perubahan Poin
  await supabase
    .from('PointLog')
    .insert([{
      customerId,
      transactionId: transaction.id,
      points: pointsEarned,
      action: 'EARN',
      description: `Dapet ${pointsEarned} poin dari transaksi #${transaction.id}`
    }]);

  return { success: true, transactionId: transaction.id, pointsEarned, tier: updatedTier };
}