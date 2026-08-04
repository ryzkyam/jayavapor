-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Customer (
  id text NOT NULL,
  name text NOT NULL,
  telegramChatId text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  tier USER-DEFINED NOT NULL DEFAULT 'BRONZE'::"Tier",
  preference USER-DEFINED NOT NULL DEFAULT 'FRUITY'::"Preference",
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Customer_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Product (
  id text NOT NULL,
  name text NOT NULL,
  sku text NOT NULL,
  category USER-DEFINED NOT NULL,
  price double precision NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  imageUrl text,
  CONSTRAINT Product_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Transaction (
  id text NOT NULL,
  customerId text NOT NULL,
  totalAmount double precision NOT NULL,
  discount double precision NOT NULL DEFAULT 0,
  finalAmount double precision NOT NULL,
  pointsEarned integer NOT NULL DEFAULT 0,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Transaction_pkey PRIMARY KEY (id),
  CONSTRAINT Transaction_customerId_fkey FOREIGN KEY (customerId) REFERENCES public.Customer(id)
);
CREATE TABLE public.TransactionItem (
  id text NOT NULL,
  transactionId text NOT NULL,
  productId text NOT NULL,
  quantity integer NOT NULL,
  priceAtSale double precision NOT NULL,
  totalPrice double precision NOT NULL,
  CONSTRAINT TransactionItem_pkey PRIMARY KEY (id),
  CONSTRAINT TransactionItem_transactionId_fkey FOREIGN KEY (transactionId) REFERENCES public.Transaction(id),
  CONSTRAINT TransactionItem_productId_fkey FOREIGN KEY (productId) REFERENCES public.Product(id)
);
CREATE TABLE public.PointLog (
  id text NOT NULL,
  customerId text NOT NULL,
  transactionId text,
  points integer NOT NULL,
  action USER-DEFINED NOT NULL,
  description text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT PointLog_pkey PRIMARY KEY (id),
  CONSTRAINT PointLog_customerId_fkey FOREIGN KEY (customerId) REFERENCES public.Customer(id),
  CONSTRAINT PointLog_transactionId_fkey FOREIGN KEY (transactionId) REFERENCES public.Transaction(id)
);
CREATE TABLE public.TgTemplate (
  id text NOT NULL,
  name text NOT NULL,
  body text NOT NULL,
  targetSegment USER-DEFINED NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT TgTemplate_pkey PRIMARY KEY (id)
);
CREATE TABLE public.TgLog (
  id text NOT NULL,
  customerId text NOT NULL,
  templateId text,
  message text NOT NULL,
  status text NOT NULL,
  type text NOT NULL,
  sentAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT TgLog_pkey PRIMARY KEY (id),
  CONSTRAINT TgLog_customerId_fkey FOREIGN KEY (customerId) REFERENCES public.Customer(id),
  CONSTRAINT TgLog_templateId_fkey FOREIGN KEY (templateId) REFERENCES public.TgTemplate(id)
);
