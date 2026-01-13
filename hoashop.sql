SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `hoashop`
--
CREATE DATABASE hoashop;
USE hoashop;
-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `addresses`
--

CREATE TABLE `addresses` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `fullAddress` varchar(191) NOT NULL,
  `ward` varchar(191) NOT NULL,
  `district` varchar(191) NOT NULL,
  `province` varchar(191) NOT NULL,
  `phoneReceiver` varchar(191) NOT NULL,
  `nameReceiver` varchar(191) NOT NULL,
  `isDefault` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `addresses`
--

INSERT INTO `addresses` (`id`, `userId`, `title`, `fullAddress`, `ward`, `district`, `province`, `phoneReceiver`, `nameReceiver`, `isDefault`, `createdAt`, `updatedAt`) VALUES
('26a53f5d-b95f-4e32-b1df-af5a7855d490', '4025bffc-3e10-4afc-9874-14804cf123ea', 'nhà tôi', 'hong co biet', 'p11', 'q10', 'hcm', '0123456789', 'loc', 0, '2025-12-04 10:37:45.177', '2025-12-04 13:48:00.575'),
('7cf15d3d-82eb-4fdd-a29e-71a6f7e7f0ab', '4025bffc-3e10-4afc-9874-14804cf123ea', 'home', 'day la dia chi de test thoi', 'phuong 12', '122', 'hcm', '1234567890', 'loc', 0, '2025-12-04 13:48:00.587', '2025-12-04 17:55:44.227'),
('c8a09d5d-c372-4117-8d89-155124ece03c', '4025bffc-3e10-4afc-9874-14804cf123ea', 'Nhà', 'aaaaaaaaaaaaaa', 'aaa', 'aaa', 'aa', '0123456789', 'ada', 1, '2025-12-04 17:55:44.233', '2025-12-04 17:55:44.233'),
('c8d3154a-ef5f-4e77-97fe-adad9b47b175', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'Nhà riêng', '123 Nguyễn Trãi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', '0912345678', 'Nguyễn Văn A', 1, '2025-12-04 04:24:46.754', '2025-12-04 04:24:46.754'),
('cca7c0fd-8df1-47d7-987d-725805bf5c47', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'Công ty', '456 Lê Lợi', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', '0912345678', 'Nguyễn Văn A', 0, '2025-12-04 04:24:46.754', '2025-12-04 04:24:46.754'),
('dea18244-b7c1-4873-a52d-23c23c08601a', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'Nhà riêng', '789 Hai Bà Trưng', 'Phường Đa Kao', 'Quận 1', 'TP. Hồ Chí Minh', '0923456789', 'Trần Thị B', 1, '2025-12-04 04:24:46.754', '2025-12-04 04:24:46.754');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `admin_replies`
--

CREATE TABLE `admin_replies` (
  `id` varchar(191) NOT NULL,
  `reviewId` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `banners`
--

CREATE TABLE `banners` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `image` varchar(191) NOT NULL,
  `link` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `banners`
--

INSERT INTO `banners` (`id`, `title`, `image`, `link`, `description`, `order`, `isActive`, `createdAt`, `updatedAt`) VALUES
('banner-1', 'Khuyến mãi mùa hè 2024', '/uploads/hoashop/products/banner1.jpg', '/products', 'Giảm giá đến 20% cho tất cả sản phẩm', 1, 1, '2025-12-04 04:24:47.098', '2025-12-04 04:24:47.098'),
('banner-2', 'Hoa tình yêu - Gửi trọn yêu thương', '/uploads/hoashop/products/banner2.jpg', '/products?category=hoa-tinh-yeu', 'Bộ sưu tập hoa tặng người yêu', 2, 1, '2025-12-04 04:24:47.104', '2025-12-04 04:24:47.104'),
('banner-3', 'Hoa cao cấp - Sang trọng đẳng cấp', '/uploads/hoashop/products/banner3.jpg', '/products?category=hoa-chuc-mung', 'Bộ sưu tập hoa cao cấp nhất', 3, 1, '2025-12-04 04:24:47.110', '2025-12-04 04:24:47.110');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `parentId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image`, `parentId`, `createdAt`, `updatedAt`) VALUES
('5cffd2e3-b8f5-4491-b9ea-ef2383ddbbdc', 'Hoa Chia Buồn', 'hoa-chia-buon', 'Hoa chia buồn, tang lễ', '/uploads/hoashop/categories/1765006757408-908d6dff1ffd1b5a.png', NULL, '2025-12-04 04:24:46.772', '2025-12-06 07:39:17.410'),
('96c70c01-48f5-4e89-b1a3-cd3c9cbf0ed2', 'Hoa Sinh Nhật', 'hoa-sinh-nhat', 'Các loại hoa dành cho sinh nhật', '/uploads/hoashop/categories/1765006558912-557d507bec428c21.jpeg', NULL, '2025-12-04 04:24:46.758', '2025-12-06 07:35:58.927'),
('a80cb0cd-86f9-4fa6-a892-0e2d90f68cff', 'Hoa Chúc Mừng', 'hoa-chuc-mung', 'Hoa chúc mừng khai trương, thăng chức', '/uploads/hoashop/categories/1765006727531-7d91929e084bdd4e.jpeg', NULL, '2025-12-04 04:24:46.769', '2025-12-06 07:38:47.534'),
('f1aea5a1-dad6-4dd1-bf98-b827a5a97c25', 'Hoa Tình Yêu', 'hoa-tinh-yeu', 'Hoa tặng người yêu', '/uploads/hoashop/categories/1765006596144-9276ff6956bfd7b6.jpeg', NULL, '2025-12-04 04:24:46.764', '2025-12-06 07:36:36.146');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `status` enum('PENDING','CONFIRMED','PREPARING','DELIVERING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `total` decimal(10,2) NOT NULL,
  `note` text DEFAULT NULL,
  `messageCard` text DEFAULT NULL,
  `senderType` enum('NAMED','ANONYMOUS') NOT NULL DEFAULT 'NAMED',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `userId`, `status`, `total`, `note`, `messageCard`, `senderType`, `createdAt`, `updatedAt`) VALUES
('01f0431c-6aaf-432d-9e13-e1dc2748c040', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'DELIVERING', 750000.00, '', 'Chúc mừng sinh nhật!', 'NAMED', '2025-12-04 04:26:21.710', '2025-12-04 04:26:21.710'),
('0cd7792d-c363-427a-9289-7e2de953f49d', '4025bffc-3e10-4afc-9874-14804cf123ea', 'CANCELLED', 2550000.00, '', 'Kính gửi Mẹ, con xin bày tỏ lòng biết ơn vô hạn trước sự chăm sóc, dạy dỗ và tình yêu thương bao la mà Mẹ đã dành cho con suốt cuộc đời. Mỗi bước đường con đi, con đều cảm nhận được sự hiện diện và những lời khuyên quý giá từ Mẹ. Mẹ là ngọn đèn soi sáng, là điểm tựa vững chắc nhất để con trưởng thành và thành công như ngày hôm nay. Con kính chúc Mẹ luôn mạnh khỏe và an yên. Con yêu Mẹ nhiều lắm! 💝', 'NAMED', '2025-12-04 11:03:02.572', '2025-12-04 11:03:28.333'),
('19a175ac-35e1-4c7a-9590-c0da261ea303', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'PENDING', 1200000.00, 'Giao hàng cẩn thận', '', 'ANONYMOUS', '2025-12-04 04:26:21.680', '2025-12-04 04:26:21.680'),
('31dcf5b4-4de5-4212-a806-2d9f25d60a75', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'DELIVERING', 1400000.00, '', 'Chúc mừng sinh nhật!', 'NAMED', '2025-12-04 04:26:21.720', '2025-12-04 04:26:21.720'),
('330dcffa-b245-4cd9-99d9-712f20f7a217', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'DELIVERING', 480000.00, 'Giao hàng cẩn thận', 'Chúc mừng sinh nhật!', 'NAMED', '2025-12-04 04:26:21.655', '2025-12-04 04:26:21.655'),
('35e17c10-6e7a-4ee3-8f49-b05b43ea9986', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'PENDING', 800000.00, 'Giao hàng cẩn thận', '', 'ANONYMOUS', '2025-12-04 04:26:21.740', '2025-12-04 04:26:21.740'),
('36d00c50-1fa3-49a7-a811-d3e0f47bd68f', '4025bffc-3e10-4afc-9874-14804cf123ea', 'PENDING', 1500000.00, 'k lấy tiền', 'Gửi đến tình yêu lớn của đời anh, chúc mừng kỷ niệm ngày chúng ta bắt đầu hành trình tình yêu này. Anh vẫn nhớ như in những khoảnh khắc đầu tiên ấy, và đến nay, mỗi kỷ niệm cùng em đều là báu vật. Cảm ơn em đã luôn là chỗ dựa vững chắc, là nguồn cảm hứng bất tận của anh. Mong rằng chúng ta sẽ còn cùng nhau viết nên thật nhiều câu chuyện đẹp đẽ nữa trong tương lai. Anh yêu em hơn tất cả! ✨', 'NAMED', '2025-12-04 10:38:47.129', '2025-12-04 10:38:47.129'),
('38e233c1-f95c-46b5-a0ee-872295c4416e', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'DELIVERING', 300000.00, '', '', 'ANONYMOUS', '2025-12-04 04:26:21.755', '2025-12-04 04:26:21.755'),
('3f59ee85-ff76-437a-8951-a09e0d1271c2', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'COMPLETED', 300000.00, 'Giao hàng cẩn thận', 'Chúc mừng sinh nhật!', 'NAMED', '2025-12-04 04:26:21.751', '2025-12-04 04:26:21.751'),
('4373b9c8-5b68-4f87-8e55-91004f5444fc', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'PENDING', 700000.00, '', 'Chúc mừng sinh nhật!', 'NAMED', '2025-12-04 04:26:21.737', '2025-12-04 04:26:21.737'),
('453adfbc-c2ff-4b95-89ea-64942e9ffa76', '4025bffc-3e10-4afc-9874-14804cf123ea', 'PENDING', 320000.00, NULL, NULL, 'NAMED', '2025-12-04 14:36:05.685', '2025-12-04 14:36:05.685'),
('4a72b870-0059-4303-b8f9-c872ef5efce9', '4025bffc-3e10-4afc-9874-14804cf123ea', 'PENDING', 2125000.00, NULL, NULL, 'NAMED', '2025-12-04 14:30:47.528', '2025-12-04 14:30:47.528'),
('51705a64-1480-421b-ad34-6b11a9ecd760', '4025bffc-3e10-4afc-9874-14804cf123ea', 'PENDING', 2125000.00, NULL, NULL, 'NAMED', '2025-12-04 14:31:31.227', '2025-12-04 14:31:31.227'),
('5ebc9770-b6cf-40d9-9603-e4b2636908e5', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'CONFIRMED', 600000.00, '', 'Chúc mừng sinh nhật!', 'NAMED', '2025-12-04 04:26:21.744', '2025-12-04 04:26:21.744'),
('7049eae4-80e0-46cd-8928-df11219db118', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'DELIVERING', 320000.00, '', '', 'ANONYMOUS', '2025-12-04 04:26:21.748', '2025-12-04 04:26:21.748'),
('71c50120-9c3a-4538-9cad-06ad505732a2', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'DELIVERING', 960000.00, 'Giao hàng cẩn thận', '', 'ANONYMOUS', '2025-12-04 04:26:21.715', '2025-12-04 04:26:21.715'),
('831c27b0-4a99-4e42-8bdb-536f30279fae', '4025bffc-3e10-4afc-9874-14804cf123ea', 'PENDING', 2125000.00, NULL, NULL, 'NAMED', '2025-12-04 14:33:39.451', '2025-12-04 14:33:39.451'),
('8d599175-c2e2-43e2-bf84-3a3105f95cd3', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'DELIVERING', 600000.00, '', '', 'ANONYMOUS', '2025-12-04 04:26:21.733', '2025-12-04 04:26:21.733'),
('8fd621ba-5e5d-42c6-9963-a9238281180d', '4025bffc-3e10-4afc-9874-14804cf123ea', 'PENDING', 2125000.00, NULL, NULL, 'NAMED', '2025-12-04 14:30:16.343', '2025-12-04 14:30:16.343'),
('93114a7a-b4dd-476f-90be-592d350a0d53', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'CANCELLED', 1400000.00, '', 'Chúc mừng sinh nhật!', 'NAMED', '2025-12-04 04:26:21.676', '2025-12-04 04:26:21.676'),
('9d7bd756-2b37-4fc5-9fb0-4749ed51fd85', '4025bffc-3e10-4afc-9874-14804cf123ea', 'PENDING', 2125000.00, NULL, NULL, 'NAMED', '2025-12-04 14:32:02.204', '2025-12-04 14:32:02.204'),
('a04882d9-74e1-4536-b084-fe7733ad093a', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'DELIVERING', 800000.00, '', 'Chúc mừng sinh nhật!', 'NAMED', '2025-12-04 04:26:21.688', '2025-12-04 04:26:21.688'),
('a53c1128-4e2f-4a9b-9907-593a573b5530', '4025bffc-3e10-4afc-9874-14804cf123ea', 'COMPLETED', 350000.00, '', '', 'NAMED', '2025-12-04 10:41:22.840', '2025-12-04 10:43:27.562'),
('af8af5c7-2288-482a-8b3a-77a2608f8f96', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'CANCELLED', 600000.00, 'Giao hàng cẩn thận', 'Chúc mừng sinh nhật!', 'NAMED', '2025-12-04 04:26:21.699', '2025-12-04 04:26:21.699'),
('b25833b1-491c-4238-8404-9abe99a0650c', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'PENDING', 1400000.00, '', '', 'ANONYMOUS', '2025-12-04 04:26:21.704', '2025-12-04 04:26:21.704'),
('c15f98a8-eea0-4b8a-b978-312fc6e4b1db', '4025bffc-3e10-4afc-9874-14804cf123ea', 'PENDING', 2125000.00, NULL, NULL, 'NAMED', '2025-12-04 14:31:46.364', '2025-12-04 14:31:46.364'),
('c29d787b-bde2-4442-8b91-0aa92fb00786', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'CANCELLED', 250000.00, '', '', 'ANONYMOUS', '2025-12-04 04:26:21.726', '2025-12-04 04:26:21.726'),
('da26f970-c82f-4ec9-90fb-56f2c64c95a5', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'DELIVERING', 600000.00, 'Giao hàng cẩn thận', 'Chúc mừng sinh nhật!', 'NAMED', '2025-12-04 04:26:21.729', '2025-12-04 04:26:21.729'),
('e133fd21-11c6-4056-83c5-21fe489f8cf6', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'PENDING', 960000.00, '', '', 'ANONYMOUS', '2025-12-04 04:26:21.694', '2025-12-04 04:26:21.694'),
('e9fb7898-045b-44fa-a2fd-06a12139fbf4', '4025bffc-3e10-4afc-9874-14804cf123ea', 'PENDING', 2125000.00, NULL, NULL, 'NAMED', '2025-12-04 14:29:10.759', '2025-12-04 14:29:10.759'),
('f8ccaec8-5e4e-416f-a462-d4b204f537e5', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'PENDING', 280000.00, '', '', 'ANONYMOUS', '2025-12-04 04:26:21.665', '2025-12-04 04:26:21.665');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `variantId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `addons` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`addons`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `orderId`, `variantId`, `quantity`, `price`, `addons`, `createdAt`) VALUES
('01b4ef53-bdb7-41aa-a4bc-fe2664b72a79', '71c50120-9c3a-4538-9cad-06ad505732a2', '81998a60-4b49-49aa-839e-1b7b47704604', 2, 480000.00, '\"[]\"', '2025-12-04 04:26:21.715'),
('09608655-2f65-44d5-a45f-b8ebbb15cdbd', 'c15f98a8-eea0-4b8a-b978-312fc6e4b1db', '7d893a78-3634-49b2-88a8-b542af82aa59', 2, 350000.00, 'null', '2025-12-04 14:31:46.375'),
('19c37269-c39e-43bd-bb6e-0c3febb4a9bd', 'a04882d9-74e1-4536-b084-fe7733ad093a', 'ca2da004-d522-4ecb-ad23-747ebdbad6ff', 1, 800000.00, '\"[]\"', '2025-12-04 04:26:21.688'),
('1c5923c7-a2fb-456e-9814-6fc42c11b5ab', 'c29d787b-bde2-4442-8b91-0aa92fb00786', 'cbb86a7d-8b8b-40f4-bf1c-dc150d29299f', 1, 250000.00, '\"[]\"', '2025-12-04 04:26:21.726'),
('2c8cfa4c-0455-4991-bf37-b1796be4a4c0', '7049eae4-80e0-46cd-8928-df11219db118', '717b7a6a-1dcc-419e-aca9-2542ff03238d', 1, 320000.00, '\"[]\"', '2025-12-04 04:26:21.748'),
('2d6f2ab6-cf7d-46fd-8c9d-0b0570f2e1af', 'b25833b1-491c-4238-8404-9abe99a0650c', '771f6cbd-6c4a-4296-bd02-78426cb03528', 2, 700000.00, '\"[]\"', '2025-12-04 04:26:21.704'),
('3362f69b-817a-40d7-b6ab-c0248920cdc5', '330dcffa-b245-4cd9-99d9-712f20f7a217', '091dfe83-22e5-4a96-8602-304d68a07701', 1, 480000.00, '\"[]\"', '2025-12-04 04:26:21.655'),
('3ce7f504-ea79-4c9b-be2c-50c39871ab36', '31dcf5b4-4de5-4212-a806-2d9f25d60a75', '771f6cbd-6c4a-4296-bd02-78426cb03528', 2, 700000.00, '\"[]\"', '2025-12-04 04:26:21.720'),
('4994bdad-4051-43f5-aeae-8ec1f1325ff9', 'a53c1128-4e2f-4a9b-9907-593a573b5530', 'a0e90050-2c73-4b73-8edf-86ad52c4569d', 1, 350000.00, 'null', '2025-12-04 10:41:22.845'),
('4dcfef11-f839-45b3-a905-5ae70d791c9d', '38e233c1-f95c-46b5-a0ee-872295c4416e', '5b3af434-17f9-4e5b-8847-18c5c39ad692', 1, 300000.00, '\"[]\"', '2025-12-04 04:26:21.755'),
('4e363672-7b50-4202-8f62-73a67f519230', '831c27b0-4a99-4e42-8bdb-536f30279fae', '9073842f-af87-42ed-a07a-c09b53bd0214', 2, 750000.00, 'null', '2025-12-04 14:33:39.460'),
('52642441-52a6-4744-8005-147a71dbe34c', 'af8af5c7-2288-482a-8b3a-77a2608f8f96', '1538b591-7f43-46fb-b5db-a39c8b789b72', 1, 600000.00, '\"[]\"', '2025-12-04 04:26:21.699'),
('52d79b3b-9000-46a0-84da-7833c0930ff3', '5ebc9770-b6cf-40d9-9603-e4b2636908e5', 'fd1b846f-5ac0-4c3f-8c18-d4e94ecf643e', 2, 300000.00, '\"[]\"', '2025-12-04 04:26:21.744'),
('6369f998-4877-445f-999a-927f3bf65dad', 'e9fb7898-045b-44fa-a2fd-06a12139fbf4', '7d893a78-3634-49b2-88a8-b542af82aa59', 2, 350000.00, 'null', '2025-12-04 14:29:10.772'),
('681e004d-359a-4835-9305-70a42676566f', 'e133fd21-11c6-4056-83c5-21fe489f8cf6', 'c9f7459b-29ff-45ca-96e2-b934d393bb7a', 2, 480000.00, '\"[]\"', '2025-12-04 04:26:21.694'),
('6ee90644-1e09-4cd1-9171-dcc0e1ec50ff', '93114a7a-b4dd-476f-90be-592d350a0d53', '12ccc3f0-ca5e-42cd-84b6-e6ffd3b483f3', 2, 700000.00, '\"[]\"', '2025-12-04 04:26:21.676'),
('7ce1c16e-d7af-47c7-b784-8727fec3be57', 'c15f98a8-eea0-4b8a-b978-312fc6e4b1db', '9073842f-af87-42ed-a07a-c09b53bd0214', 2, 750000.00, 'null', '2025-12-04 14:31:46.378'),
('828be15f-be4c-4927-8f7c-b2df5e8e01ce', '0cd7792d-c363-427a-9289-7e2de953f49d', '9368df3d-1228-402d-912b-a7e442bc9589', 3, 850000.00, 'null', '2025-12-04 11:03:02.587'),
('88617a47-6ea1-412a-9662-5725b0e47b4b', '9d7bd756-2b37-4fc5-9fb0-4749ed51fd85', '9073842f-af87-42ed-a07a-c09b53bd0214', 2, 750000.00, 'null', '2025-12-04 14:32:02.211'),
('9355eefe-4f51-4183-a197-c5e78e534574', '8d599175-c2e2-43e2-bf84-3a3105f95cd3', '389d06b4-54d8-4710-9d08-4098e40176df', 1, 600000.00, '\"[]\"', '2025-12-04 04:26:21.733'),
('98a79e3d-b10b-483b-9666-575569b22572', '01f0431c-6aaf-432d-9e13-e1dc2748c040', '88729e1f-696f-4961-85d9-da3b517fbc07', 1, 750000.00, '\"[]\"', '2025-12-04 04:26:21.710'),
('99914e4a-3cfd-4608-aae3-7336f602d74f', 'e9fb7898-045b-44fa-a2fd-06a12139fbf4', '9073842f-af87-42ed-a07a-c09b53bd0214', 2, 750000.00, 'null', '2025-12-04 14:29:10.786'),
('a32e704f-5ae7-43ac-8355-38053968c243', '4a72b870-0059-4303-b8f9-c872ef5efce9', '9073842f-af87-42ed-a07a-c09b53bd0214', 2, 750000.00, 'null', '2025-12-04 14:30:47.544'),
('afc0de2f-da35-4d80-94b2-37aa1785c3a6', '51705a64-1480-421b-ad34-6b11a9ecd760', '7d893a78-3634-49b2-88a8-b542af82aa59', 2, 350000.00, 'null', '2025-12-04 14:31:31.233'),
('b626f145-66ff-4b49-90ad-7958f9ff8a99', '831c27b0-4a99-4e42-8bdb-536f30279fae', '7d893a78-3634-49b2-88a8-b542af82aa59', 2, 350000.00, 'null', '2025-12-04 14:33:39.457'),
('b991bd55-8d6a-491f-a48e-25c779f3e907', '8fd621ba-5e5d-42c6-9963-a9238281180d', '7d893a78-3634-49b2-88a8-b542af82aa59', 2, 350000.00, 'null', '2025-12-04 14:30:16.350'),
('bc39c024-5a71-438f-b0de-b381804a4d72', '8fd621ba-5e5d-42c6-9963-a9238281180d', '9073842f-af87-42ed-a07a-c09b53bd0214', 2, 750000.00, 'null', '2025-12-04 14:30:16.355'),
('bc45728a-cbf8-4363-bc93-8289a900f5ab', '4373b9c8-5b68-4f87-8e55-91004f5444fc', 'abb66494-135c-4039-8cfe-de39dd4369be', 1, 700000.00, '\"[]\"', '2025-12-04 04:26:21.737'),
('bd08527e-131d-4c4d-bdf8-fd36bbedc8fa', '453adfbc-c2ff-4b95-89ea-64942e9ffa76', '83ce4ab2-0201-43a1-a1c0-9cf5d2ed173e', 1, 320000.00, 'null', '2025-12-04 14:36:05.694'),
('bf58a38d-38eb-4f2c-b2c9-56c3a6ad3937', '19a175ac-35e1-4c7a-9590-c0da261ea303', '136a90ae-82ce-4a56-8ddb-02552b08be8b', 2, 600000.00, '\"[]\"', '2025-12-04 04:26:21.680'),
('c63d9813-3861-4dbc-ae67-8760332dbe02', 'da26f970-c82f-4ec9-90fb-56f2c64c95a5', 'e17db782-e11f-4fce-bb36-b2725c519ab5', 1, 600000.00, '\"[]\"', '2025-12-04 04:26:21.729'),
('e1aa2ad9-9494-4a14-8dcd-7a73e7b02a54', '9d7bd756-2b37-4fc5-9fb0-4749ed51fd85', '7d893a78-3634-49b2-88a8-b542af82aa59', 2, 350000.00, 'null', '2025-12-04 14:32:02.208'),
('e1e46e57-1be0-4baa-ac3e-a7144e3dc157', '35e17c10-6e7a-4ee3-8f49-b05b43ea9986', 'ca2da004-d522-4ecb-ad23-747ebdbad6ff', 1, 800000.00, '\"[]\"', '2025-12-04 04:26:21.740'),
('e52f19fc-6370-4420-9b79-d45486c6c313', '51705a64-1480-421b-ad34-6b11a9ecd760', '9073842f-af87-42ed-a07a-c09b53bd0214', 2, 750000.00, 'null', '2025-12-04 14:31:31.238'),
('f45bf119-de7b-41b7-a4b3-3356aa3faada', 'f8ccaec8-5e4e-416f-a462-d4b204f537e5', 'f6e455cc-ce44-42e2-adeb-9f22d5eed6a1', 1, 280000.00, '\"[]\"', '2025-12-04 04:26:21.665'),
('f77e640b-22ac-4f3b-a012-2c94e9448963', '4a72b870-0059-4303-b8f9-c872ef5efce9', '7d893a78-3634-49b2-88a8-b542af82aa59', 2, 350000.00, 'null', '2025-12-04 14:30:47.538'),
('f85de7d5-73ba-45c0-a160-954e7307c89a', '3f59ee85-ff76-437a-8951-a09e0d1271c2', 'd9d567a3-cfdc-488f-bd1a-498819dac9ae', 1, 300000.00, '\"[]\"', '2025-12-04 04:26:21.751'),
('fdd2e06c-a9c6-4969-9a7b-717a36c2177a', '36d00c50-1fa3-49a7-a811-d3e0f47bd68f', '9073842f-af87-42ed-a07a-c09b53bd0214', 2, 750000.00, 'null', '2025-12-04 10:38:47.136');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_receivers`
--

CREATE TABLE `order_receivers` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `address` text NOT NULL,
  `deliveryDate` datetime(3) NOT NULL,
  `deliverySlot` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_receivers`
--

INSERT INTO `order_receivers` (`id`, `orderId`, `name`, `phone`, `address`, `deliveryDate`, `deliverySlot`, `createdAt`, `updatedAt`) VALUES
('01350494-3c75-4fb7-bd87-90a0b79353b9', '38e233c1-f95c-46b5-a0ee-872295c4416e', 'Người nhận 20', '0900000019', '654 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM', '2025-12-23 04:26:21.754', '14-16h', '2025-12-04 04:26:21.755', '2025-12-04 04:26:21.755'),
('0a5b96df-6dca-4eca-bdcd-4e93edd2d06a', 'da26f970-c82f-4ec9-90fb-56f2c64c95a5', 'Người nhận 13', '0900000012', '789 Hai Bà Trưng, Q.1, TP.HCM', '2025-12-16 04:26:21.729', '8-10h', '2025-12-04 04:26:21.729', '2025-12-04 04:26:21.729'),
('1ef1238e-17e2-46af-ae43-f616a5ffa26c', '3f59ee85-ff76-437a-8951-a09e0d1271c2', 'Người nhận 19', '0900000018', '321 Cách Mạng Tháng 8, Q.10, TP.HCM', '2025-12-22 04:26:21.750', '8-10h', '2025-12-04 04:26:21.751', '2025-12-04 04:26:21.751'),
('29142abb-ef26-49f7-a411-8c2aada7eb55', '51705a64-1480-421b-ad34-6b11a9ecd760', 'loc', '1234567890', 'day la dia chi de test thoi', '2025-12-05 00:00:00.000', '08:00-10:00', '2025-12-04 14:31:31.232', '2025-12-04 14:31:31.232'),
('31af8e6d-b4c3-4245-864f-691ae9da5d0b', '4373b9c8-5b68-4f87-8e55-91004f5444fc', 'Người nhận 15', '0900000014', '654 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM', '2025-12-18 04:26:21.736', '8-10h', '2025-12-04 04:26:21.737', '2025-12-04 04:26:21.737'),
('372e0e92-ecdf-4fc0-b2b2-ddebfe9e32cb', 'a04882d9-74e1-4536-b084-fe7733ad093a', 'Người nhận 5', '0900000004', '654 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM', '2025-12-08 04:26:21.686', '8-10h', '2025-12-04 04:26:21.688', '2025-12-04 04:26:21.688'),
('38acaf7c-5ef0-4fef-bb5b-b72eb1e7052b', '330dcffa-b245-4cd9-99d9-712f20f7a217', 'Người nhận 1', '0900000000', '123 Nguyễn Trãi, Q.1, TP.HCM', '2025-12-04 04:26:21.654', '8-10h', '2025-12-04 04:26:21.655', '2025-12-04 04:26:21.655'),
('42c6637b-8489-482d-a487-d0be4b014497', 'a53c1128-4e2f-4a9b-9907-593a573b5530', 'loc', '0123456789', 'hong co biet', '2025-12-12 00:00:00.000', '14:00-16:00', '2025-12-04 10:41:22.843', '2025-12-04 10:41:22.843'),
('42de3250-44ca-4281-8420-da649e87f711', '31dcf5b4-4de5-4212-a806-2d9f25d60a75', 'Người nhận 11', '0900000010', '123 Nguyễn Trãi, Q.1, TP.HCM', '2025-12-14 04:26:21.719', '8-10h', '2025-12-04 04:26:21.720', '2025-12-04 04:26:21.720'),
('44d32732-8e92-4bc6-8840-0571896477d5', 'e9fb7898-045b-44fa-a2fd-06a12139fbf4', 'loc', '1234567890', 'day la dia chi de test thoi', '2025-12-05 00:00:00.000', '08:00-10:00', '2025-12-04 14:29:10.764', '2025-12-04 14:29:10.764'),
('4d04ed7f-feb7-4b69-a107-d65e933d78d1', 'f8ccaec8-5e4e-416f-a462-d4b204f537e5', 'Người nhận 2', '0900000001', '456 Lê Lợi, Q.3, TP.HCM', '2025-12-05 04:26:21.664', '14-16h', '2025-12-04 04:26:21.665', '2025-12-04 04:26:21.665'),
('5118cc34-8dce-4322-8dc5-7cddd359d4ff', '5ebc9770-b6cf-40d9-9603-e4b2636908e5', 'Người nhận 17', '0900000016', '456 Lê Lợi, Q.3, TP.HCM', '2025-12-20 04:26:21.743', '8-10h', '2025-12-04 04:26:21.744', '2025-12-04 04:26:21.744'),
('5a8c8564-4352-4993-8630-980baeaaecfe', '8d599175-c2e2-43e2-bf84-3a3105f95cd3', 'Người nhận 14', '0900000013', '321 Cách Mạng Tháng 8, Q.10, TP.HCM', '2025-12-17 04:26:21.732', '14-16h', '2025-12-04 04:26:21.733', '2025-12-04 04:26:21.733'),
('6173b96d-f815-4a74-b85a-02efc2d5bcf8', 'e133fd21-11c6-4056-83c5-21fe489f8cf6', 'Người nhận 6', '0900000005', '123 Nguyễn Trãi, Q.1, TP.HCM', '2025-12-09 04:26:21.692', '14-16h', '2025-12-04 04:26:21.694', '2025-12-04 04:26:21.694'),
('82c14ea3-b256-4fc0-8df7-35299d3dcaa9', '831c27b0-4a99-4e42-8bdb-536f30279fae', 'loc', '1234567890', 'day la dia chi de test thoi', '2025-12-05 00:00:00.000', '08:00-10:00', '2025-12-04 14:33:39.455', '2025-12-04 14:33:39.455'),
('8f6906ad-76af-49e3-b60c-d2e6b8f04056', 'c15f98a8-eea0-4b8a-b978-312fc6e4b1db', 'loc', '1234567890', 'day la dia chi de test thoi', '2025-12-05 00:00:00.000', '08:00-10:00', '2025-12-04 14:31:46.369', '2025-12-04 14:31:46.369'),
('94ebeba9-481d-4728-945b-3843eb1a6495', '4a72b870-0059-4303-b8f9-c872ef5efce9', 'loc', '1234567890', 'day la dia chi de test thoi', '2025-12-05 00:00:00.000', '08:00-10:00', '2025-12-04 14:30:47.536', '2025-12-04 14:30:47.536'),
('9aa7c861-20b6-4f79-a079-3c86c4a40905', '0cd7792d-c363-427a-9289-7e2de953f49d', 'loc', '0123456789', 'hong co biet', '2025-12-13 00:00:00.000', '10:00-12:00', '2025-12-04 11:03:02.581', '2025-12-04 11:03:02.581'),
('9bb1d744-7498-480e-aea7-f261da9bdb41', '19a175ac-35e1-4c7a-9590-c0da261ea303', 'Người nhận 4', '0900000003', '321 Cách Mạng Tháng 8, Q.10, TP.HCM', '2025-12-07 04:26:21.679', '14-16h', '2025-12-04 04:26:21.680', '2025-12-04 04:26:21.680'),
('ab1a752f-ef7d-4fa7-80b5-a734d4ddd341', '93114a7a-b4dd-476f-90be-592d350a0d53', 'Người nhận 3', '0900000002', '789 Hai Bà Trưng, Q.1, TP.HCM', '2025-12-06 04:26:21.675', '8-10h', '2025-12-04 04:26:21.676', '2025-12-04 04:26:21.676'),
('b1b94726-cf27-4ab3-8c4f-a69f794bad19', '453adfbc-c2ff-4b95-89ea-64942e9ffa76', 'loc', '1234567890', 'day la dia chi de test thoi', '2025-12-05 00:00:00.000', '08:00-10:00', '2025-12-04 14:36:05.692', '2025-12-04 14:36:05.692'),
('c0687dc8-4c84-49df-b82c-5792325360d8', '7049eae4-80e0-46cd-8928-df11219db118', 'Người nhận 18', '0900000017', '789 Hai Bà Trưng, Q.1, TP.HCM', '2025-12-21 04:26:21.747', '14-16h', '2025-12-04 04:26:21.748', '2025-12-04 04:26:21.748'),
('c0ba0c1a-0163-411e-9f47-e875ae57b36f', '8fd621ba-5e5d-42c6-9963-a9238281180d', 'loc', '1234567890', 'day la dia chi de test thoi', '2025-12-05 00:00:00.000', '08:00-10:00', '2025-12-04 14:30:16.348', '2025-12-04 14:30:16.348'),
('c0dbeead-61c2-4cf7-9748-bf1fd2901348', 'b25833b1-491c-4238-8404-9abe99a0650c', 'Người nhận 8', '0900000007', '789 Hai Bà Trưng, Q.1, TP.HCM', '2025-12-11 04:26:21.703', '14-16h', '2025-12-04 04:26:21.704', '2025-12-04 04:26:21.704'),
('c2acd749-977a-49ad-9d7c-17d9235565e5', 'af8af5c7-2288-482a-8b3a-77a2608f8f96', 'Người nhận 7', '0900000006', '456 Lê Lợi, Q.3, TP.HCM', '2025-12-10 04:26:21.698', '8-10h', '2025-12-04 04:26:21.699', '2025-12-04 04:26:21.699'),
('d687f5b4-8ced-408b-a465-cd71de50bb51', '71c50120-9c3a-4538-9cad-06ad505732a2', 'Người nhận 10', '0900000009', '654 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM', '2025-12-13 04:26:21.714', '14-16h', '2025-12-04 04:26:21.715', '2025-12-04 04:26:21.715'),
('ddaa27be-0775-4dcc-8ce7-71a8a5d685f2', '9d7bd756-2b37-4fc5-9fb0-4749ed51fd85', 'loc', '1234567890', 'day la dia chi de test thoi', '2025-12-05 00:00:00.000', '08:00-10:00', '2025-12-04 14:32:02.206', '2025-12-04 14:32:02.206'),
('e2b7234e-e9dd-4456-a08c-502b352a73fc', 'c29d787b-bde2-4442-8b91-0aa92fb00786', 'Người nhận 12', '0900000011', '456 Lê Lợi, Q.3, TP.HCM', '2025-12-15 04:26:21.725', '14-16h', '2025-12-04 04:26:21.726', '2025-12-04 04:26:21.726'),
('e393f66a-d790-4ec6-a3c2-9222b292df9b', '35e17c10-6e7a-4ee3-8f49-b05b43ea9986', 'Người nhận 16', '0900000015', '123 Nguyễn Trãi, Q.1, TP.HCM', '2025-12-19 04:26:21.739', '14-16h', '2025-12-04 04:26:21.740', '2025-12-04 04:26:21.740'),
('ea8ce5df-ed31-40cb-b99c-ce856754c9e0', '36d00c50-1fa3-49a7-a811-d3e0f47bd68f', 'loc', '0123456789', 'hong co biet', '2025-12-05 00:00:00.000', '08:00-10:00', '2025-12-04 10:38:47.133', '2025-12-04 10:38:47.133'),
('ef874769-6d06-426d-b807-4f56cc74d09b', '01f0431c-6aaf-432d-9e13-e1dc2748c040', 'Người nhận 9', '0900000008', '321 Cách Mạng Tháng 8, Q.10, TP.HCM', '2025-12-12 04:26:21.709', '8-10h', '2025-12-04 04:26:21.710', '2025-12-04 04:26:21.710');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE `payments` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `status` enum('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `method` enum('COD','BANK_TRANSFER','MOMO','VNPAY') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`id`, `orderId`, `status`, `method`, `amount`, `createdAt`, `updatedAt`) VALUES
('01960444-f538-4f7e-b609-1546c670a4ba', '31dcf5b4-4de5-4212-a806-2d9f25d60a75', 'PENDING', 'COD', 1400000.00, '2025-12-04 04:26:21.720', '2025-12-04 04:26:21.720'),
('045f0634-e069-49f4-92d4-b8da043f71e8', 'a53c1128-4e2f-4a9b-9907-593a573b5530', 'PAID', 'COD', 350000.00, '2025-12-04 10:41:22.853', '2025-12-04 10:43:27.571'),
('0ff94912-f1c0-4155-b8a7-f682ca85e2c4', 'b25833b1-491c-4238-8404-9abe99a0650c', 'PENDING', 'COD', 1400000.00, '2025-12-04 04:26:21.704', '2025-12-04 04:26:21.704'),
('192f664a-887e-4212-89a9-1166d8481153', '0cd7792d-c363-427a-9289-7e2de953f49d', 'PENDING', 'COD', 2550000.00, '2025-12-04 11:03:02.592', '2025-12-04 11:03:02.592'),
('26ae1b34-4b96-4aec-aaab-565bbfc68c2a', 'da26f970-c82f-4ec9-90fb-56f2c64c95a5', 'PENDING', 'COD', 600000.00, '2025-12-04 04:26:21.729', '2025-12-04 04:26:21.729'),
('2d362478-c707-4ef0-9b19-0d3d1208f54f', 'af8af5c7-2288-482a-8b3a-77a2608f8f96', 'FAILED', 'BANK_TRANSFER', 600000.00, '2025-12-04 04:26:21.699', '2025-12-04 04:26:21.699'),
('2e887e9a-1738-47c9-b3da-e24907e7137f', '19a175ac-35e1-4c7a-9590-c0da261ea303', 'PENDING', 'COD', 1200000.00, '2025-12-04 04:26:21.680', '2025-12-04 04:26:21.680'),
('314e8232-2d97-4dce-a4ff-387405b14de5', '38e233c1-f95c-46b5-a0ee-872295c4416e', 'PENDING', 'COD', 300000.00, '2025-12-04 04:26:21.755', '2025-12-04 04:26:21.755'),
('3acb03bb-b16b-4cac-9ef2-0d0aefa46c29', '9d7bd756-2b37-4fc5-9fb0-4749ed51fd85', 'PENDING', 'COD', 2125000.00, '2025-12-04 14:32:02.216', '2025-12-04 14:32:02.216'),
('3d8f51ff-04d6-49b4-9ff5-76a21ab3b067', '51705a64-1480-421b-ad34-6b11a9ecd760', 'PENDING', 'COD', 2125000.00, '2025-12-04 14:31:31.244', '2025-12-04 14:31:31.244'),
('6d7446c5-1414-4d55-99f8-eb025d7de696', '4a72b870-0059-4303-b8f9-c872ef5efce9', 'PENDING', 'COD', 2125000.00, '2025-12-04 14:30:47.551', '2025-12-04 14:30:47.551'),
('70d9991a-eff2-45fa-af91-1787cc52937b', 'a04882d9-74e1-4536-b084-fe7733ad093a', 'PENDING', 'VNPAY', 800000.00, '2025-12-04 04:26:21.688', '2025-12-04 04:26:21.688'),
('7dc49e2a-4fcd-442f-a26b-28016808315b', '93114a7a-b4dd-476f-90be-592d350a0d53', 'FAILED', 'VNPAY', 1400000.00, '2025-12-04 04:26:21.676', '2025-12-04 04:26:21.676'),
('811e8a5f-06e7-4976-a020-dc3880e76e3b', 'c29d787b-bde2-4442-8b91-0aa92fb00786', 'FAILED', 'COD', 250000.00, '2025-12-04 04:26:21.726', '2025-12-04 04:26:21.726'),
('880963eb-5627-4c03-88e5-af84d5bc4a56', '831c27b0-4a99-4e42-8bdb-536f30279fae', 'PENDING', 'COD', 2125000.00, '2025-12-04 14:33:39.465', '2025-12-04 14:33:39.465'),
('8868e455-cbde-4a38-803e-2ccb2accb2f7', '01f0431c-6aaf-432d-9e13-e1dc2748c040', 'PENDING', 'VNPAY', 750000.00, '2025-12-04 04:26:21.710', '2025-12-04 04:26:21.710'),
('9e31214c-3424-494c-af1d-e3166f877070', '453adfbc-c2ff-4b95-89ea-64942e9ffa76', 'PENDING', 'COD', 320000.00, '2025-12-04 14:36:05.702', '2025-12-04 14:36:05.702'),
('a23543a9-c3f9-493a-a0d2-abd7b0e70be5', '330dcffa-b245-4cd9-99d9-712f20f7a217', 'PENDING', 'BANK_TRANSFER', 480000.00, '2025-12-04 04:26:21.655', '2025-12-04 04:26:21.655'),
('a89f3b8c-ab7e-49ed-af7e-d20b6d12bbf2', '3f59ee85-ff76-437a-8951-a09e0d1271c2', 'PAID', 'BANK_TRANSFER', 300000.00, '2025-12-04 04:26:21.751', '2025-12-04 04:26:21.751'),
('ab6e651d-bf18-4813-936e-47eb6abaa3d1', 'c15f98a8-eea0-4b8a-b978-312fc6e4b1db', 'PENDING', 'COD', 2125000.00, '2025-12-04 14:31:46.385', '2025-12-04 14:31:46.385'),
('af7250c3-d561-4142-814d-2ae4873f7431', 'e9fb7898-045b-44fa-a2fd-06a12139fbf4', 'PENDING', 'COD', 2125000.00, '2025-12-04 14:29:10.791', '2025-12-04 14:29:10.791'),
('b51232a2-8f34-49eb-9677-be6b5aadb1a2', '35e17c10-6e7a-4ee3-8f49-b05b43ea9986', 'PENDING', 'BANK_TRANSFER', 800000.00, '2025-12-04 04:26:21.740', '2025-12-04 04:26:21.740'),
('ba70d6d7-523c-4c8b-8494-3d26f8e47b25', '7049eae4-80e0-46cd-8928-df11219db118', 'PENDING', 'BANK_TRANSFER', 320000.00, '2025-12-04 04:26:21.748', '2025-12-04 04:26:21.748'),
('bd23e43f-d9a8-493c-847e-0583e5cb5240', '4373b9c8-5b68-4f87-8e55-91004f5444fc', 'PENDING', 'BANK_TRANSFER', 700000.00, '2025-12-04 04:26:21.737', '2025-12-04 04:26:21.737'),
('d061bfb4-26bd-4207-acc6-35cb62681c30', 'e133fd21-11c6-4056-83c5-21fe489f8cf6', 'PENDING', 'VNPAY', 960000.00, '2025-12-04 04:26:21.694', '2025-12-04 04:26:21.694'),
('d338530a-3ff6-46cc-98dd-14847886b0ad', '8fd621ba-5e5d-42c6-9963-a9238281180d', 'PENDING', 'COD', 2125000.00, '2025-12-04 14:30:16.359', '2025-12-04 14:30:16.359'),
('d79ea78a-4913-447a-a911-e8ee166281d0', '8d599175-c2e2-43e2-bf84-3a3105f95cd3', 'PENDING', 'BANK_TRANSFER', 600000.00, '2025-12-04 04:26:21.733', '2025-12-04 04:26:21.733'),
('e53af376-e0f1-4a62-a851-2845115d9e18', '5ebc9770-b6cf-40d9-9603-e4b2636908e5', 'PENDING', 'BANK_TRANSFER', 600000.00, '2025-12-04 04:26:21.744', '2025-12-04 04:26:21.744'),
('f3e182ed-b642-4cc3-9684-6a45c1d1849d', 'f8ccaec8-5e4e-416f-a462-d4b204f537e5', 'PENDING', 'COD', 280000.00, '2025-12-04 04:26:21.665', '2025-12-04 04:26:21.665'),
('f71a0dba-cc09-4267-9837-9c2c663bff81', '36d00c50-1fa3-49a7-a811-d3e0f47bd68f', 'PENDING', 'COD', 1500000.00, '2025-12-04 10:38:47.139', '2025-12-04 10:38:47.139'),
('ff6c3071-3ec2-4312-bc64-2733243fd6f4', '71c50120-9c3a-4538-9cad-06ad505732a2', 'PENDING', 'BANK_TRANSFER', 960000.00, '2025-12-04 04:26:21.715', '2025-12-04 04:26:21.715');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`images`)),
  `categoryId` varchar(191) NOT NULL,
  `metaTitle` varchar(191) DEFAULT NULL,
  `metaDescription` text DEFAULT NULL,
  `metaKeywords` text DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `title`, `slug`, `description`, `images`, `categoryId`, `metaTitle`, `metaDescription`, `metaKeywords`, `isActive`, `createdAt`, `updatedAt`) VALUES
('02df2eba-61b2-4ad3-9f9f-5993f475f986', 'Bó Hoa Xanh Blue Charm', 'bo-hoa-xanh-blue-charm', 'Bó hoa tông xanh dương độc đáo', '[\"uploads/hoashop/products/hoa11.jpg\",\"uploads/hoashop/products/hoa12.jpg\"]', '96c70c01-48f5-4e89-b1a3-cd3c9cbf0ed2', 'Bó Hoa Xanh Blue Charm', 'Bó hoa tông xanh dương độc đáo', NULL, 1, '2025-12-04 04:24:46.877', '2025-12-04 04:24:46.877'),
('0996f5ca-1cf1-4e37-9c12-59b853d79929', 'Hoa Đồng Tiền Vàng May Mắn', 'hoa-dong-tien-vang-may-man', 'Hoa đồng tiền vàng tượng trưng tài lộc', '[\"uploads/hoashop/products/hoa2.jpg\",\"uploads/hoashop/products/hoa5.jpg\"]', 'a80cb0cd-86f9-4fa6-a892-0e2d90f68cff', 'Hoa Đồng Tiền Vàng May Mắn', 'Hoa đồng tiền vàng tượng trưng tài lộc', NULL, 1, '2025-12-04 04:24:46.838', '2025-12-04 04:24:46.838'),
('12494ab2-cde1-48ae-aad5-ef8b98044580', 'Giỏ Hoa Hồng Pastel Mix', 'gio-hoa-hong-pastel-mix', 'Giỏ hoa hồng pastel mix nhẹ nhàng', '[\"uploads/hoashop/products/hoa10.jpg\",\"uploads/hoashop/products/hoa7.jpg\"]', 'f1aea5a1-dad6-4dd1-bf98-b827a5a97c25', 'Giỏ Hoa Hồng Pastel Mix', 'Giỏ hoa hồng pastel mix nhẹ nhàng', NULL, 1, '2025-12-04 04:24:46.856', '2025-12-04 04:24:46.856'),
('176a420d-501f-4c48-a262-95a32324ade0', 'Bó Hoa Hồng Đỏ Tình Yêu', 'bo-hoa-hong-do-tinh-yeu', 'Bó hoa hồng đỏ Ecuador cao cấp, thể hiện tình yêu nồng cháy', '[\"uploads/hoashop/products/hoa9.jpg\",\"uploads/hoashop/products/hoa5.jpg\"]', 'f1aea5a1-dad6-4dd1-bf98-b827a5a97c25', 'Bó Hoa Hồng Đỏ Tình Yêu', 'Bó hoa hồng đỏ Ecuador cao cấp, thể hiện tình yêu nồng cháy', NULL, 1, '2025-12-04 04:24:46.777', '2025-12-04 04:24:46.777'),
('19fb461f-3353-4717-9da0-e7bef72aae11', 'Bó Hoa Lavender Provence', 'bo-hoa-lavender-provence', 'Hoa lavender Provence thơm dịu nhẹ', '[\"uploads/hoashop/products/hoa4.jpg\",\"uploads/hoashop/products/hoa2.jpg\"]', '96c70c01-48f5-4e89-b1a3-cd3c9cbf0ed2', 'Bó Hoa Lavender Provence', 'Hoa lavender Provence thơm dịu nhẹ', NULL, 1, '2025-12-04 04:24:46.864', '2025-12-04 04:24:46.864'),
('2354316e-ace9-49a2-aa56-5543270434a2', 'Kệ Hoa Chia Buồn Tang Lễ', 'ke-hoa-chia-buon-tang-le', 'Kệ hoa chia buồn trang nghiêm, thành kính', '[\"uploads/hoashop/products/hoa9.jpg\",\"uploads/hoashop/products/hoa1.jpg\"]', '5cffd2e3-b8f5-4491-b9ea-ef2383ddbbdc', 'Kệ Hoa Chia Buồn Tang Lễ', 'Kệ hoa chia buồn trang nghiêm, thành kính', NULL, 1, '2025-12-04 04:24:46.815', '2025-12-04 04:24:46.815'),
('3f766ccd-269a-40f8-a64b-afd6ab2e3ebc', 'Lan Vàng Kim Hoàng Hậu', 'lan-vang-kim-hoang-hau', 'Lan vàng kim hoàng hậu sang trọng', '[\"uploads/hoashop/products/hoa4.jpg\",\"uploads/hoashop/products/hoa6.jpg\"]', 'a80cb0cd-86f9-4fa6-a892-0e2d90f68cff', 'Lan Vàng Kim Hoàng Hậu', 'Lan vàng kim hoàng hậu sang trọng', NULL, 1, '2025-12-04 04:24:46.868', '2025-12-04 04:24:46.868'),
('44594029-f34a-4532-bbe5-d07ce2013b35', 'Hộp Hoa Sáp Bất Tử', 'hop-hoa-sap-bat-tu', 'Hoa sáp handmade bền đẹp lâu năm', '[\"uploads/hoashop/products/hoa7.jpg\",\"uploads/hoashop/products/hoa8.jpg\"]', 'f1aea5a1-dad6-4dd1-bf98-b827a5a97c25', 'Hộp Hoa Sáp Bất Tử', 'Hoa sáp handmade bền đẹp lâu năm', NULL, 1, '2025-12-04 04:24:46.884', '2025-12-04 04:24:46.884'),
('46a05e1b-80cd-4e0f-8f4e-a9adbf053e90', 'Kệ Hoa Khai Trương 3 Tầng', 'ke-hoa-khai-truong-3-tang', 'Kệ hoa khai trương 3 tầng hoành tráng', '[\"uploads/hoashop/products/hoa12.jpg\",\"uploads/hoashop/products/hoa2.jpg\"]', 'a80cb0cd-86f9-4fa6-a892-0e2d90f68cff', 'Kệ Hoa Khai Trương 3 Tầng', 'Kệ hoa khai trương 3 tầng hoành tráng', NULL, 1, '2025-12-04 04:24:46.846', '2025-12-04 04:24:46.846'),
('47db4092-b898-4de1-a4d8-8754affa2121', 'Hoa Cúc Họa Mi Trắng Tinh Khôi', 'hoa-cuc-hoa-mi-trang', 'Cúc họa mi trắng thanh khiết, trang nghiêm', '[\"uploads/hoashop/products/hoa12.jpg\",\"uploads/hoashop/products/hoa1.jpg\"]', '5cffd2e3-b8f5-4491-b9ea-ef2383ddbbdc', 'Hoa Cúc Họa Mi Trắng Tinh Khôi', 'Cúc họa mi trắng thanh khiết, trang nghiêm', NULL, 1, '2025-12-04 04:24:46.860', '2025-12-04 04:24:46.860'),
('48ffb810-8d85-4c7b-b821-e30fd5cf5a38', 'Lan Hồ Điệp 5 Cành Trắng', 'lan-ho-diep-5-canh-trang', 'Chậu lan hồ điệp trắng 5 cành sang trọng', '[\"uploads/hoashop/products/hoa9.jpg\",\"uploads/hoashop/products/hoa11.jpg\"]', 'a80cb0cd-86f9-4fa6-a892-0e2d90f68cff', 'Lan Hồ Điệp 5 Cành Trắng', 'Chậu lan hồ điệp trắng 5 cành sang trọng', NULL, 1, '2025-12-04 04:24:46.831', '2025-12-04 04:24:46.831'),
('4c469fe1-d7ff-4fc7-ad6c-5cf85899c00d', 'Giỏ Hoa Chúc Mừng Khai Trương', 'gio-hoa-chuc-mung-khai-truong', 'Giỏ hoa chúc mừng sang trọng, thể hiện sự thịnh vượng', '[\"uploads/hoashop/products/hoa6.jpg\",\"uploads/hoashop/products/hoa7.jpg\"]', 'a80cb0cd-86f9-4fa6-a892-0e2d90f68cff', 'Giỏ Hoa Chúc Mừng Khai Trương', 'Giỏ hoa chúc mừng sang trọng, thể hiện sự thịnh vượng', NULL, 1, '2025-12-04 04:24:46.799', '2025-12-04 04:24:46.799'),
('4ed557a5-4c8d-437d-a408-d559a957598e', 'Kệ Hoa Chia Buồn Cao Cấp', 'ke-hoa-chia-buon-cao-cap', 'Kệ hoa chia buồn 2 tầng cao cấp', '[\"uploads/hoashop/products/hoa1.jpg\",\"uploads/hoashop/products/hoa11.jpg\"]', '5cffd2e3-b8f5-4491-b9ea-ef2383ddbbdc', 'Kệ Hoa Chia Buồn Cao Cấp', 'Kệ hoa chia buồn 2 tầng cao cấp', NULL, 1, '2025-12-04 04:24:46.887', '2025-12-04 11:03:38.016'),
('79dcbd9f-e9c3-482f-ac0a-92cb56a5a22e', 'Bó Hoa Cát Tường Lavender', 'bo-hoa-cat-tuong-lavender', 'Cát tường màu lavender nhẹ nhàng thơ mộng', '[\"uploads/hoashop/products/hoa8.jpg\",\"uploads/hoashop/products/hoa1.jpg\"]', 'f1aea5a1-dad6-4dd1-bf98-b827a5a97c25', 'Bó Hoa Cát Tường Lavender', 'Cát tường màu lavender nhẹ nhàng thơ mộng', NULL, 1, '2025-12-04 04:24:46.842', '2025-12-04 04:24:46.842'),
('8b1d83db-f26f-442c-ae87-4c050eb5dd01', 'Bó Cẩm Chướng Ngọt Ngào', 'bo-cam-chuong-ngot-ngao', 'Cẩm chướng nhiều màu sắc, dễ thương và đáng yêu', '[\"uploads/hoashop/products/hoa5.jpg\",\"uploads/hoashop/products/hoa3.jpg\"]', '96c70c01-48f5-4e89-b1a3-cd3c9cbf0ed2', 'Bó Cẩm Chướng Ngọt Ngào', 'Cẩm chướng nhiều màu sắc, dễ thương và đáng yêu', NULL, 1, '2025-12-04 04:24:46.796', '2025-12-04 04:24:46.796'),
('91eea9cd-5742-4e95-8836-fb94690b4d1f', 'Giỏ Hoa Sinh Nhật Sweet 18', 'gio-hoa-sinh-nhat-sweet-18', 'Giỏ hoa sinh nhật tuổi 18 đặc biệt', '[\"uploads/hoashop/products/hoa3.jpg\",\"uploads/hoashop/products/hoa1.jpg\"]', '96c70c01-48f5-4e89-b1a3-cd3c9cbf0ed2', 'Giỏ Hoa Sinh Nhật Sweet 18', 'Giỏ hoa sinh nhật tuổi 18 đặc biệt', NULL, 1, '2025-12-04 04:24:46.880', '2025-12-04 04:24:46.880'),
('9b65c5f4-a9cb-428a-9994-ec12dde964b0', 'Hoa Hồng Ecuador Premium', 'hoa-hong-ecuador-premium', 'Hoa hồng Ecuador size XXL cao cấp nhất', '[\"uploads/hoashop/products/hoa9.jpg\",\"uploads/hoashop/products/hoa4.jpg\"]', 'f1aea5a1-dad6-4dd1-bf98-b827a5a97c25', 'Hoa Hồng Ecuador Premium', 'Hoa hồng Ecuador size XXL cao cấp nhất', NULL, 1, '2025-12-04 04:24:46.872', '2025-12-04 04:24:46.872'),
('a92160d2-cda6-451f-a10b-5833278d64d6', 'Giỏ Lan Hồ Điệp Chúc Mừng', 'gio-lan-ho-diep-chuc-mung', 'Giỏ lan hồ điệp sang trọng, thích hợp khai trương', '[\"uploads/hoashop/products/hoa6.jpg\",\"uploads/hoashop/products/hoa8.jpg\"]', 'a80cb0cd-86f9-4fa6-a892-0e2d90f68cff', 'Giỏ Lan Hồ Điệp Chúc Mừng', 'Giỏ lan hồ điệp sang trọng, thích hợp khai trương', NULL, 1, '2025-12-04 04:24:46.786', '2025-12-04 04:24:46.786'),
('a93683b0-2ea0-4045-a7ca-8a6dfdaeb483', 'Hoa Ly Trắng Cao Quý', 'hoa-ly-trang-cao-quy', 'Hoa ly trắng thanh lịch, trang nghiêm', '[\"uploads/hoashop/products/hoa11.jpg\",\"uploads/hoashop/products/hoa8.jpg\"]', '5cffd2e3-b8f5-4491-b9ea-ef2383ddbbdc', 'Hoa Ly Trắng Cao Quý', 'Hoa ly trắng thanh lịch, trang nghiêm', NULL, 1, '2025-12-04 04:24:46.803', '2025-12-04 04:24:46.803'),
('ac1dc3e6-52e0-449e-bdb9-991d285bf7c6', 'Bó Hoa Cúc Tana Tím', 'bo-hoa-cuc-tana-tim', 'Cúc tana màu tím pastel xinh xắn', '[\"uploads/hoashop/products/hoa12.jpg\",\"uploads/hoashop/products/hoa11.jpg\"]', '96c70c01-48f5-4e89-b1a3-cd3c9cbf0ed2', 'Bó Hoa Cúc Tana Tím', 'Cúc tana màu tím pastel xinh xắn', NULL, 1, '2025-12-04 04:24:46.834', '2025-12-04 04:24:46.834'),
('af140299-9618-4176-8a77-445fd10caaf1', 'Hoa Hồng Phớt Ngọt Ngào', 'hoa-hong-phot-ngot-ngao', 'Hoa hồng màu hồng phớt, lãng mạn và ngọt ngào', '[\"uploads/hoashop/products/hoa2.jpg\",\"uploads/hoashop/products/hoa6.jpg\"]', 'f1aea5a1-dad6-4dd1-bf98-b827a5a97c25', 'Hoa Hồng Phớt Ngọt Ngào', 'Hoa hồng màu hồng phớt, lãng mạn và ngọt ngào', NULL, 1, '2025-12-04 04:24:46.811', '2025-12-04 04:24:46.811'),
('c8fc99a7-6d9e-4a45-ba7e-18bb7174c494', 'Hoa Hồng Trắng Tinh Khôi', 'hoa-hong-trang-tinh-khoi', 'Hoa hồng trắng thuần khiết, tượng trưng tình yêu trong sáng', '[\"uploads/hoashop/products/hoa7.jpg\",\"uploads/hoashop/products/hoa12.jpg\"]', 'f1aea5a1-dad6-4dd1-bf98-b827a5a97c25', 'Hoa Hồng Trắng Tinh Khôi', 'Hoa hồng trắng thuần khiết, tượng trưng tình yêu trong sáng', NULL, 1, '2025-12-04 04:24:46.793', '2025-12-04 04:24:46.793'),
('c9401ed5-9e7c-45c7-a34e-5690dbde175c', 'Hoa Hồng Juliet Garden', 'hoa-hong-juliet-garden', 'Hoa hồng Juliet Garden cao cấp nhập khẩu', '[\"uploads/hoashop/products/hoa9.jpg\",\"uploads/hoashop/products/hoa2.jpg\"]', 'f1aea5a1-dad6-4dd1-bf98-b827a5a97c25', 'Hoa Hồng Juliet Garden', 'Hoa hồng Juliet Garden cao cấp nhập khẩu', NULL, 1, '2025-12-04 04:24:46.849', '2025-12-04 04:24:46.849'),
('d5278d12-b65e-43b5-b8ae-e421d91531fa', 'Bó Hoa Mẫu Đơn Sang Trọng', 'bo-hoa-mau-don-sang-trong', 'Hoa mẫu đơn quý phái và sang trọng', '[\"uploads/hoashop/products/hoa9.jpg\",\"uploads/hoashop/products/hoa11.jpg\"]', '96c70c01-48f5-4e89-b1a3-cd3c9cbf0ed2', 'Bó Hoa Mẫu Đơn Sang Trọng', 'Hoa mẫu đơn quý phái và sang trọng', NULL, 1, '2025-12-04 04:24:46.853', '2025-12-04 04:24:46.853'),
('da18def5-075a-484e-9fe7-f03490f2df78', 'Bó Tulip Sinh Nhật Sang Trọng', 'bo-tulip-sinh-nhat', 'Bó tulip Hà Lan nhập khẩu, màu sắc tươi sáng', '[\"uploads/hoashop/products/hoa7.jpg\",\"uploads/hoashop/products/hoa1.jpg\"]', '96c70c01-48f5-4e89-b1a3-cd3c9cbf0ed2', 'Bó Tulip Sinh Nhật Sang Trọng', 'Bó tulip Hà Lan nhập khẩu, màu sắc tươi sáng', NULL, 1, '2025-12-04 04:24:46.783', '2025-12-04 04:24:46.783'),
('f01fea94-292f-4da4-bc7f-3a5e57f1bf79', 'Bó Hướng Dương Tươi Sáng', 'bo-huong-duong-tuoi-sang', 'Bó hướng dương rực rỡ, mang đến niềm vui', '[\"/uploads/hoashop/products/1765007073187-b2de1b1b515da014.jpeg\",\"/uploads/hoashop/products/1765007094103-b5be1e5cd28d70ee.jpeg\"]', '96c70c01-48f5-4e89-b1a3-cd3c9cbf0ed2', 'Bó Hướng Dương Tươi Sáng', 'Bó hướng dương rực rỡ, mang đến niềm vui', NULL, 1, '2025-12-04 04:24:46.788', '2025-12-06 07:45:03.126'),
('f0abb628-5c8b-4b25-b817-41007f443652', 'Hộp Hoa Hồng Cao Cấp', 'hop-hoa-hong-cao-cap', 'Hộp hoa hồng đỏ trong hộp sang trọng', '[\"uploads/hoashop/products/hoa12.jpg\",\"uploads/hoashop/products/hoa4.jpg\"]', 'f1aea5a1-dad6-4dd1-bf98-b827a5a97c25', 'Hộp Hoa Hồng Cao Cấp', 'Hộp hoa hồng đỏ trong hộp sang trọng', NULL, 1, '2025-12-04 04:24:46.823', '2025-12-04 04:24:46.823'),
('f6e5bed3-313e-4e82-8598-29bdb600d5e8', 'Bó Hoa Baby Mix Pastel', 'bo-hoa-baby-mix-pastel', 'Bó hoa baby pastel nhẹ nhàng, dễ thương', '[\"uploads/hoashop/products/hoa7.jpg\",\"uploads/hoashop/products/hoa12.jpg\"]', '96c70c01-48f5-4e89-b1a3-cd3c9cbf0ed2', 'Bó Hoa Baby Mix Pastel', 'Bó hoa baby pastel nhẹ nhàng, dễ thương', NULL, 1, '2025-12-04 04:24:46.807', '2025-12-04 04:24:46.807'),
('fa553528-ccd1-4d52-b21f-0f69fa39222b', 'Bó Hoa Cầu Vồng Rực Rỡ', 'bo-hoa-cau-vong-ruc-ro', 'Bó hoa đa màu sắc như cầu vồng, tươi vui', '[\"uploads/hoashop/products/hoa6.jpg\",\"uploads/hoashop/products/hoa8.jpg\"]', '96c70c01-48f5-4e89-b1a3-cd3c9cbf0ed2', 'Bó Hoa Cầu Vồng Rực Rỡ', 'Bó hoa đa màu sắc như cầu vồng, tươi vui', NULL, 1, '2025-12-04 04:24:46.818', '2025-12-04 04:24:46.818'),
('feffb436-b8e5-4c9e-905b-4ff063980376', 'Giỏ Hoa Tulip Hà Lan', 'gio-hoa-tulip-ha-lan', 'Giỏ tulip nhập khẩu Hà Lan cao cấp', '[\"uploads/hoashop/products/hoa5.jpg\",\"uploads/hoashop/products/hoa1.jpg\"]', '96c70c01-48f5-4e89-b1a3-cd3c9cbf0ed2', 'Giỏ Hoa Tulip Hà Lan', 'Giỏ tulip nhập khẩu Hà Lan cao cấp', NULL, 1, '2025-12-04 04:24:46.827', '2025-12-04 04:24:46.827');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_variants`
--

CREATE TABLE `product_variants` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `size` enum('S','M','L') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_variants`
--

INSERT INTO `product_variants` (`id`, `productId`, `size`, `price`, `description`, `stock`, `isActive`, `createdAt`, `updatedAt`) VALUES
('059de0fc-462f-4033-a4f8-f53e6e820f3b', '48ffb810-8d85-4c7b-b821-e30fd5cf5a38', 'L', 850000.00, 'Size lớn - 30-40 bông', 21, 1, '2025-12-04 04:24:46.993', '2025-12-04 04:24:46.993'),
('091dfe83-22e5-4a96-8602-304d68a07701', 'f6e5bed3-313e-4e82-8598-29bdb600d5e8', 'M', 480000.00, 'Size vừa - 20-25 bông', 27, 1, '2025-12-04 04:24:46.961', '2025-12-04 04:24:46.961'),
('12ccc3f0-ca5e-42cd-84b6-e6ffd3b483f3', '4c469fe1-d7ff-4fc7-ad6c-5cf85899c00d', 'L', 700000.00, 'Size lớn - 30-40 bông', 16, 1, '2025-12-04 04:24:46.952', '2025-12-04 04:24:46.952'),
('135703e2-9483-4ef6-919b-2ad386e26e51', 'feffb436-b8e5-4c9e-905b-4ff063980376', 'L', 750000.00, 'Size lớn - 30-40 bông', 19, 1, '2025-12-04 04:24:46.988', '2025-12-04 04:24:46.988'),
('136a90ae-82ce-4a56-8ddb-02552b08be8b', '91eea9cd-5742-4e95-8836-fb94690b4d1f', 'M', 600000.00, 'Size vừa - 20-25 bông', 37, 1, '2025-12-04 04:24:47.070', '2025-12-04 04:24:47.070'),
('1475e152-2a31-4676-9ded-d43bf80b014c', '9b65c5f4-a9cb-428a-9994-ec12dde964b0', 'S', 300000.00, 'Size nhỏ - 10-15 bông', 20, 1, '2025-12-04 04:24:47.053', '2025-12-04 04:24:47.053'),
('1538b591-7f43-46fb-b5db-a39c8b789b72', 'a92160d2-cda6-451f-a10b-5833278d64d6', 'M', 600000.00, 'Size vừa - 20-25 bông', 30, 1, '2025-12-04 04:24:46.913', '2025-12-04 04:24:46.913'),
('1cd6afa5-f459-45ed-886f-8b815e27ac77', 'a93683b0-2ea0-4045-a7ca-8a6dfdaeb483', 'L', 950000.00, 'Size lớn - 30-40 bông', 29, 1, '2025-12-04 04:24:46.957', '2025-12-04 04:24:46.957'),
('250e7c0f-d45d-43e8-934a-6303bfe7b997', 'a92160d2-cda6-451f-a10b-5833278d64d6', 'S', 350000.00, 'Size nhỏ - 10-15 bông', 34, 1, '2025-12-04 04:24:46.911', '2025-12-04 04:24:46.911'),
('2ba0c188-5a7c-4c08-9354-c078415e4e2f', '48ffb810-8d85-4c7b-b821-e30fd5cf5a38', 'M', 550000.00, 'Size vừa - 20-25 bông', 33, 1, '2025-12-04 04:24:46.992', '2025-12-04 04:24:46.992'),
('2d9782f8-d30c-400e-8be4-4c508bc7995c', '176a420d-501f-4c48-a262-95a32324ade0', 'M', 500000.00, 'Size vừa - 20-25 bông', 20, 1, '2025-12-04 04:24:46.897', '2025-12-04 04:24:46.897'),
('30f36155-4a50-48d8-b75d-62aaf0aadd58', '9b65c5f4-a9cb-428a-9994-ec12dde964b0', 'M', 500000.00, 'Size vừa - 20-25 bông', 25, 1, '2025-12-04 04:24:47.056', '2025-12-04 04:24:47.056'),
('319c2080-a0bd-4246-a98d-83ad4ea92ef7', 'f01fea94-292f-4da4-bc7f-3a5e57f1bf79', 'S', 280000.00, 'Size nhỏ - 10-15 bông', 40, 1, '2025-12-06 07:45:03.137', '2025-12-06 07:45:03.137'),
('32688c89-6ccf-473e-a365-b922eb6c62d3', '176a420d-501f-4c48-a262-95a32324ade0', 'S', 300000.00, 'Size nhỏ - 10-15 bông', 43, 1, '2025-12-04 04:24:46.894', '2025-12-04 04:24:46.894'),
('389d06b4-54d8-4710-9d08-4098e40176df', 'a93683b0-2ea0-4045-a7ca-8a6dfdaeb483', 'M', 600000.00, 'Size vừa - 20-25 bông', 26, 1, '2025-12-04 04:24:46.956', '2025-12-04 04:24:46.956'),
('3e48319b-4e47-46d6-b222-d141c4e48187', 'ac1dc3e6-52e0-449e-bdb9-991d285bf7c6', 'M', 500000.00, 'Size vừa - 20-25 bông', 47, 1, '2025-12-04 04:24:46.996', '2025-12-04 04:24:46.996'),
('435a4e2a-9c80-4088-9a18-f46db081bcc5', 'c9401ed5-9e7c-45c7-a34e-5690dbde175c', 'L', 850000.00, 'Size lớn - 30-40 bông', 20, 1, '2025-12-04 04:24:47.018', '2025-12-04 04:24:47.018'),
('43c3a0fa-a5b3-40d0-aa63-510f4c71ae5c', '47db4092-b898-4de1-a4d8-8754affa2121', 'M', 600000.00, 'Size vừa - 20-25 bông', 30, 1, '2025-12-04 04:24:47.033', '2025-12-04 04:24:47.033'),
('44c15440-67f7-4d1a-90a4-b7766930e4ca', 'af140299-9618-4176-8a77-445fd10caaf1', 'M', 550000.00, 'Size vừa - 20-25 bông', 48, 1, '2025-12-04 04:24:46.965', '2025-12-04 04:24:46.965'),
('4500ce53-8b78-41d4-9712-f0d2d9afbe87', '46a05e1b-80cd-4e0f-8f4e-a9adbf053e90', 'S', 280000.00, 'Size nhỏ - 10-15 bông', 46, 1, '2025-12-04 04:24:47.009', '2025-12-04 04:24:47.009'),
('453aa333-fcea-4a08-bad1-3ac768b38622', '0996f5ca-1cf1-4e37-9c12-59b853d79929', 'M', 450000.00, 'Size vừa - 20-25 bông', 22, 1, '2025-12-04 04:24:47.000', '2025-12-04 04:24:47.000'),
('494b90b6-2d88-4c14-9806-74571362e8b7', '3f766ccd-269a-40f8-a64b-afd6ab2e3ebc', 'M', 550000.00, 'Size vừa - 20-25 bông', 24, 1, '2025-12-04 04:24:47.047', '2025-12-04 04:24:47.047'),
('526d603b-7342-4899-9fcb-2a99baed91ab', '19fb461f-3353-4717-9da0-e7bef72aae11', 'S', 280000.00, 'Size nhỏ - 10-15 bông', 49, 1, '2025-12-04 04:24:47.037', '2025-12-04 04:24:47.037'),
('55c0721d-13e1-4443-8147-aab424cd41f1', '19fb461f-3353-4717-9da0-e7bef72aae11', 'M', 480000.00, 'Size vừa - 20-25 bông', 40, 1, '2025-12-04 04:24:47.039', '2025-12-04 04:24:47.039'),
('5b3af434-17f9-4e5b-8847-18c5c39ad692', 'ac1dc3e6-52e0-449e-bdb9-991d285bf7c6', 'S', 300000.00, 'Size nhỏ - 10-15 bông', 20, 1, '2025-12-04 04:24:46.994', '2025-12-04 04:24:46.994'),
('5b56ce7b-55e4-496e-ab72-725f8e7b7c0e', 'fa553528-ccd1-4d52-b21f-0f69fa39222b', 'S', 250000.00, 'Size nhỏ - 10-15 bông', 28, 1, '2025-12-04 04:24:46.974', '2025-12-04 04:24:46.974'),
('5ccf4c77-2b83-4f14-ba30-9b30fde513bf', '79dcbd9f-e9c3-482f-ac0a-92cb56a5a22e', 'S', 350000.00, 'Size nhỏ - 10-15 bông', 20, 1, '2025-12-04 04:24:47.004', '2025-12-04 04:24:47.004'),
('63ba2ef1-6a26-472b-8f4e-1358a64d3b71', '2354316e-ace9-49a2-aa56-5543270434a2', 'L', 800000.00, 'Size lớn - 30-40 bông', 15, 1, '2025-12-04 04:24:46.972', '2025-12-04 04:24:46.972'),
('643e1989-f8cc-4948-9e74-2ae7c5b6afe0', 'f0abb628-5c8b-4b25-b817-41007f443652', 'L', 950000.00, 'Size lớn - 30-40 bông', 25, 1, '2025-12-04 04:24:46.982', '2025-12-04 04:24:46.982'),
('65652e26-5bc5-4937-91ea-1428cc150e29', 'd5278d12-b65e-43b5-b8ae-e421d91531fa', 'S', 300000.00, 'Size nhỏ - 10-15 bông', 20, 1, '2025-12-04 04:24:47.020', '2025-12-04 04:24:47.020'),
('6566361d-9e04-4314-845e-0dd190d11300', 'da18def5-075a-484e-9fe7-f03490f2df78', 'M', 450000.00, 'Size vừa - 20-25 bông', 43, 1, '2025-12-04 04:24:46.907', '2025-12-04 04:24:46.907'),
('65cf1e3e-1152-4058-979a-fedef388ee2b', '47db4092-b898-4de1-a4d8-8754affa2121', 'L', 950000.00, 'Size lớn - 30-40 bông', 26, 1, '2025-12-04 04:24:47.035', '2025-12-04 04:24:47.035'),
('68848698-9fb3-4c7f-937a-8e9082a05432', 'd5278d12-b65e-43b5-b8ae-e421d91531fa', 'M', 500000.00, 'Size vừa - 20-25 bông', 44, 1, '2025-12-04 04:24:47.022', '2025-12-04 04:24:47.022'),
('6bf77f61-c16d-4984-bf8d-976b0e028408', '2354316e-ace9-49a2-aa56-5543270434a2', 'M', 500000.00, 'Size vừa - 20-25 bông', 35, 1, '2025-12-04 04:24:46.971', '2025-12-04 04:24:46.971'),
('6d4e25e0-5899-4090-9ed5-3137aef194d0', 'f01fea94-292f-4da4-bc7f-3a5e57f1bf79', 'M', 480000.00, 'Size vừa - 20-25 bông', 46, 1, '2025-12-06 07:45:03.137', '2025-12-06 07:45:03.137'),
('6e8b09c0-2142-4a9a-b7a7-198f3f14dc65', '4c469fe1-d7ff-4fc7-ad6c-5cf85899c00d', 'S', 250000.00, 'Size nhỏ - 10-15 bông', 29, 1, '2025-12-04 04:24:46.941', '2025-12-04 04:24:46.941'),
('6ff04e9b-a850-420a-a953-97e57bbb772d', 'f01fea94-292f-4da4-bc7f-3a5e57f1bf79', 'L', 750000.00, 'Size lớn - 30-40 bông', 25, 1, '2025-12-06 07:45:03.137', '2025-12-06 07:45:03.137'),
('717b7a6a-1dcc-419e-aca9-2542ff03238d', 'c8fc99a7-6d9e-4a45-ba7e-18bb7174c494', 'S', 320000.00, 'Size nhỏ - 10-15 bông', 39, 1, '2025-12-04 04:24:46.925', '2025-12-04 04:24:46.925'),
('71be8ae4-3874-4009-a527-1c2c01bd986f', 'c8fc99a7-6d9e-4a45-ba7e-18bb7174c494', 'L', 850000.00, 'Size lớn - 30-40 bông', 25, 1, '2025-12-04 04:24:46.930', '2025-12-04 04:24:46.930'),
('76ab4d21-d6aa-41c5-b6be-7f21b654d22b', '4ed557a5-4c8d-437d-a408-d559a957598e', 'M', 550000.00, 'Size vừa - 20-25 bông', 30, 1, '2025-12-04 04:24:47.082', '2025-12-04 04:24:47.082'),
('771f6cbd-6c4a-4296-bd02-78426cb03528', '12494ab2-cde1-48ae-aad5-ef8b98044580', 'L', 700000.00, 'Size lớn - 30-40 bông', 11, 1, '2025-12-04 04:24:47.029', '2025-12-04 04:24:47.029'),
('7d893a78-3634-49b2-88a8-b542af82aa59', 'f0abb628-5c8b-4b25-b817-41007f443652', 'S', 350000.00, 'Size nhỏ - 10-15 bông', 26, 1, '2025-12-04 04:24:46.978', '2025-12-04 14:33:39.458'),
('7dfae5cb-c2e2-4d1c-88db-9c32a7920903', 'f0abb628-5c8b-4b25-b817-41007f443652', 'M', 600000.00, 'Size vừa - 20-25 bông', 28, 1, '2025-12-04 04:24:46.980', '2025-12-04 04:24:46.980'),
('8024006a-9e68-4f38-a986-f09f6706a152', '46a05e1b-80cd-4e0f-8f4e-a9adbf053e90', 'M', 480000.00, 'Size vừa - 20-25 bông', 28, 1, '2025-12-04 04:24:47.011', '2025-12-04 04:24:47.011'),
('8095d91c-6b9b-4b00-b29b-33442dd1051a', '19fb461f-3353-4717-9da0-e7bef72aae11', 'L', 750000.00, 'Size lớn - 30-40 bông', 10, 1, '2025-12-04 04:24:47.042', '2025-12-04 04:24:47.042'),
('81998a60-4b49-49aa-839e-1b7b47704604', 'feffb436-b8e5-4c9e-905b-4ff063980376', 'M', 480000.00, 'Size vừa - 20-25 bông', 36, 1, '2025-12-04 04:24:46.986', '2025-12-04 04:24:46.986'),
('83ce4ab2-0201-43a1-a1c0-9cf5d2ed173e', '4ed557a5-4c8d-437d-a408-d559a957598e', 'S', 320000.00, 'Size nhỏ - 10-15 bông', 29, 1, '2025-12-04 04:24:47.080', '2025-12-04 14:36:05.700'),
('840eb527-7255-46d7-940e-2a142dc040b8', '44594029-f34a-4532-bbe5-d07ce2013b35', 'S', 280000.00, 'Size nhỏ - 10-15 bông', 22, 1, '2025-12-04 04:24:47.074', '2025-12-04 04:24:47.074'),
('86844d8a-31ac-4b28-98f4-f4defdf2528c', '4c469fe1-d7ff-4fc7-ad6c-5cf85899c00d', 'M', 450000.00, 'Size vừa - 20-25 bông', 48, 1, '2025-12-04 04:24:46.943', '2025-12-04 04:24:46.943'),
('88729e1f-696f-4961-85d9-da3b517fbc07', '46a05e1b-80cd-4e0f-8f4e-a9adbf053e90', 'L', 750000.00, 'Size lớn - 30-40 bông', 11, 1, '2025-12-04 04:24:47.013', '2025-12-04 04:24:47.013'),
('898a5a97-26f9-482e-8b14-1cb00c7f76ca', 'af140299-9618-4176-8a77-445fd10caaf1', 'S', 320000.00, 'Size nhỏ - 10-15 bông', 23, 1, '2025-12-04 04:24:46.964', '2025-12-04 04:24:46.964'),
('8ea44004-c841-4e4b-8263-061fd6d73dd4', '79dcbd9f-e9c3-482f-ac0a-92cb56a5a22e', 'L', 950000.00, 'Size lớn - 30-40 bông', 17, 1, '2025-12-04 04:24:47.008', '2025-12-04 04:24:47.008'),
('8eb12855-f1f5-4379-a43b-37aecb6e53b6', 'feffb436-b8e5-4c9e-905b-4ff063980376', 'S', 280000.00, 'Size nhỏ - 10-15 bông', 46, 1, '2025-12-04 04:24:46.983', '2025-12-04 04:24:46.983'),
('9073842f-af87-42ed-a07a-c09b53bd0214', '44594029-f34a-4532-bbe5-d07ce2013b35', 'L', 750000.00, 'Size lớn - 30-40 bông', 10, 1, '2025-12-04 04:24:47.078', '2025-12-04 14:33:39.463'),
('90c1d77e-4ef8-4f15-8a7e-fd35ff3a3047', 'a93683b0-2ea0-4045-a7ca-8a6dfdaeb483', 'S', 350000.00, 'Size nhỏ - 10-15 bông', 47, 1, '2025-12-04 04:24:46.954', '2025-12-04 04:24:46.954'),
('9368df3d-1228-402d-912b-a7e442bc9589', '4ed557a5-4c8d-437d-a408-d559a957598e', 'L', 850000.00, 'Size lớn - 30-40 bông', 14, 1, '2025-12-04 04:24:47.084', '2025-12-04 11:03:02.590'),
('941ba6a9-60e4-4348-b9eb-87ae8b0b7275', 'da18def5-075a-484e-9fe7-f03490f2df78', 'S', 250000.00, 'Size nhỏ - 10-15 bông', 42, 1, '2025-12-04 04:24:46.904', '2025-12-04 04:24:46.904'),
('96c66629-a266-465a-b144-5493aa971000', '8b1d83db-f26f-442c-ae87-4c050eb5dd01', 'L', 800000.00, 'Size lớn - 30-40 bông', 26, 1, '2025-12-04 04:24:46.939', '2025-12-04 04:24:46.939'),
('9834f3e2-a5f4-4789-b014-e563e9bf62f2', '9b65c5f4-a9cb-428a-9994-ec12dde964b0', 'L', 800000.00, 'Size lớn - 30-40 bông', 11, 1, '2025-12-04 04:24:47.058', '2025-12-04 04:24:47.058'),
('a0e90050-2c73-4b73-8edf-86ad52c4569d', '91eea9cd-5742-4e95-8836-fb94690b4d1f', 'S', 350000.00, 'Size nhỏ - 10-15 bông', 46, 1, '2025-12-04 04:24:47.068', '2025-12-04 10:41:22.850'),
('a476fd15-eff5-4082-b88c-362ed619d049', 'fa553528-ccd1-4d52-b21f-0f69fa39222b', 'M', 450000.00, 'Size vừa - 20-25 bông', 34, 1, '2025-12-04 04:24:46.975', '2025-12-04 04:24:46.975'),
('ab05f94d-a280-44aa-aa22-6c0852dd3d75', 'd5278d12-b65e-43b5-b8ae-e421d91531fa', 'L', 800000.00, 'Size lớn - 30-40 bông', 17, 1, '2025-12-04 04:24:47.024', '2025-12-04 04:24:47.024'),
('abb66494-135c-4039-8cfe-de39dd4369be', '02df2eba-61b2-4ad3-9f9f-5993f475f986', 'L', 700000.00, 'Size lớn - 30-40 bông', 20, 1, '2025-12-04 04:24:47.065', '2025-12-04 04:24:47.065'),
('b5115dd4-b4b8-4586-8dc9-aea06c7bca1a', '12494ab2-cde1-48ae-aad5-ef8b98044580', 'M', 450000.00, 'Size vừa - 20-25 bông', 24, 1, '2025-12-04 04:24:47.027', '2025-12-04 04:24:47.027'),
('b62d8e0e-da1e-46f2-bb2b-109b6cf3ee3c', '48ffb810-8d85-4c7b-b821-e30fd5cf5a38', 'S', 320000.00, 'Size nhỏ - 10-15 bông', 32, 1, '2025-12-04 04:24:46.990', '2025-12-04 04:24:46.990'),
('b7fe50e9-e4f8-4baa-a249-3c8ebe3ae232', '12494ab2-cde1-48ae-aad5-ef8b98044580', 'S', 250000.00, 'Size nhỏ - 10-15 bông', 21, 1, '2025-12-04 04:24:47.025', '2025-12-04 04:24:47.025'),
('bcd1e269-2376-41f4-ab4e-8b61a4e01331', '3f766ccd-269a-40f8-a64b-afd6ab2e3ebc', 'S', 320000.00, 'Size nhỏ - 10-15 bông', 46, 1, '2025-12-04 04:24:47.045', '2025-12-04 04:24:47.045'),
('bdbea627-042b-423c-98b3-160c1dd5b269', 'c8fc99a7-6d9e-4a45-ba7e-18bb7174c494', 'M', 550000.00, 'Size vừa - 20-25 bông', 45, 1, '2025-12-04 04:24:46.928', '2025-12-04 04:24:46.928'),
('c11cfba6-e3f7-4e1a-b26f-1e6d5f7b7206', 'f6e5bed3-313e-4e82-8598-29bdb600d5e8', 'L', 750000.00, 'Size lớn - 30-40 bông', 18, 1, '2025-12-04 04:24:46.963', '2025-12-04 04:24:46.963'),
('c1365aaa-1632-49c0-9cbf-64e5c7bb8b9c', 'fa553528-ccd1-4d52-b21f-0f69fa39222b', 'L', 700000.00, 'Size lớn - 30-40 bông', 24, 1, '2025-12-04 04:24:46.977', '2025-12-04 04:24:46.977'),
('c329d73f-9e32-4b96-9eb8-99afeee6bbbf', '47db4092-b898-4de1-a4d8-8754affa2121', 'S', 350000.00, 'Size nhỏ - 10-15 bông', 47, 1, '2025-12-04 04:24:47.031', '2025-12-04 04:24:47.031'),
('c6a535b2-b93b-4f55-b489-6a6fd759c943', '176a420d-501f-4c48-a262-95a32324ade0', 'L', 800000.00, 'Size lớn - 30-40 bông', 15, 1, '2025-12-04 04:24:46.901', '2025-12-04 04:24:46.901'),
('c8467791-6bad-48e2-a53d-585710001a40', '02df2eba-61b2-4ad3-9f9f-5993f475f986', 'M', 450000.00, 'Size vừa - 20-25 bông', 22, 1, '2025-12-04 04:24:47.063', '2025-12-04 04:24:47.063'),
('c9f7459b-29ff-45ca-96e2-b934d393bb7a', '44594029-f34a-4532-bbe5-d07ce2013b35', 'M', 480000.00, 'Size vừa - 20-25 bông', 49, 1, '2025-12-04 04:24:47.076', '2025-12-04 04:24:47.076'),
('ca2da004-d522-4ecb-ad23-747ebdbad6ff', 'ac1dc3e6-52e0-449e-bdb9-991d285bf7c6', 'L', 800000.00, 'Size lớn - 30-40 bông', 14, 1, '2025-12-04 04:24:46.997', '2025-12-04 04:24:46.997'),
('cab6cf69-6d0c-4546-994b-25d748e21323', '0996f5ca-1cf1-4e37-9c12-59b853d79929', 'S', 250000.00, 'Size nhỏ - 10-15 bông', 23, 1, '2025-12-04 04:24:46.999', '2025-12-04 04:24:46.999'),
('cbb86a7d-8b8b-40f4-bf1c-dc150d29299f', '02df2eba-61b2-4ad3-9f9f-5993f475f986', 'S', 250000.00, 'Size nhỏ - 10-15 bông', 23, 1, '2025-12-04 04:24:47.060', '2025-12-04 04:24:47.060'),
('cf6be17b-ed59-406f-ba6e-cf75c1d270c1', 'af140299-9618-4176-8a77-445fd10caaf1', 'L', 850000.00, 'Size lớn - 30-40 bông', 21, 1, '2025-12-04 04:24:46.967', '2025-12-04 04:24:46.967'),
('d1af6c7b-d020-44e6-a2d3-d05158cf6bb5', 'a92160d2-cda6-451f-a10b-5833278d64d6', 'L', 950000.00, 'Size lớn - 30-40 bông', 20, 1, '2025-12-04 04:24:46.915', '2025-12-04 04:24:46.915'),
('d4aaaa1e-e0c4-423e-9393-a8b216c7857f', '0996f5ca-1cf1-4e37-9c12-59b853d79929', 'L', 700000.00, 'Size lớn - 30-40 bông', 16, 1, '2025-12-04 04:24:47.002', '2025-12-04 04:24:47.002'),
('d9d567a3-cfdc-488f-bd1a-498819dac9ae', '2354316e-ace9-49a2-aa56-5543270434a2', 'S', 300000.00, 'Size nhỏ - 10-15 bông', 45, 1, '2025-12-04 04:24:46.969', '2025-12-04 04:24:46.969'),
('e17db782-e11f-4fce-bb36-b2725c519ab5', '79dcbd9f-e9c3-482f-ac0a-92cb56a5a22e', 'M', 600000.00, 'Size vừa - 20-25 bông', 22, 1, '2025-12-04 04:24:47.006', '2025-12-04 04:24:47.006'),
('e5ce4553-bc7f-4e0e-b866-65cc004fc1e3', 'c9401ed5-9e7c-45c7-a34e-5690dbde175c', 'M', 550000.00, 'Size vừa - 20-25 bông', 38, 1, '2025-12-04 04:24:47.016', '2025-12-04 04:24:47.016'),
('e89b0dcb-7841-4fb3-8e02-470818462762', '8b1d83db-f26f-442c-ae87-4c050eb5dd01', 'M', 500000.00, 'Size vừa - 20-25 bông', 29, 1, '2025-12-04 04:24:46.935', '2025-12-04 04:24:46.935'),
('ee99653d-4a99-426c-8840-8b677464bc99', '91eea9cd-5742-4e95-8836-fb94690b4d1f', 'L', 950000.00, 'Size lớn - 30-40 bông', 15, 1, '2025-12-04 04:24:47.072', '2025-12-04 04:24:47.072'),
('f6e455cc-ce44-42e2-adeb-9f22d5eed6a1', 'f6e5bed3-313e-4e82-8598-29bdb600d5e8', 'S', 280000.00, 'Size nhỏ - 10-15 bông', 23, 1, '2025-12-04 04:24:46.959', '2025-12-04 04:24:46.959'),
('f7ef0dc5-ba8f-46a6-ad21-189016252e1b', 'c9401ed5-9e7c-45c7-a34e-5690dbde175c', 'S', 320000.00, 'Size nhỏ - 10-15 bông', 48, 1, '2025-12-04 04:24:47.015', '2025-12-04 04:24:47.015'),
('fb0937bc-c531-413c-ab30-4586461c37dd', 'da18def5-075a-484e-9fe7-f03490f2df78', 'L', 700000.00, 'Size lớn - 30-40 bông', 22, 1, '2025-12-04 04:24:46.909', '2025-12-04 04:24:46.909'),
('fd1b846f-5ac0-4c3f-8c18-d4e94ecf643e', '8b1d83db-f26f-442c-ae87-4c050eb5dd01', 'S', 300000.00, 'Size nhỏ - 10-15 bông', 32, 1, '2025-12-04 04:24:46.933', '2025-12-04 04:24:46.933'),
('fd38bfa6-6b04-4cf2-8a69-6de0772a405c', '3f766ccd-269a-40f8-a64b-afd6ab2e3ebc', 'L', 850000.00, 'Size lớn - 30-40 bông', 14, 1, '2025-12-04 04:24:47.050', '2025-12-04 04:24:47.050');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text NOT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `isHidden` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `reviews`
--

INSERT INTO `reviews` (`id`, `userId`, `productId`, `rating`, `comment`, `images`, `isHidden`, `createdAt`, `updatedAt`) VALUES
('086fc0de-e183-489d-95db-951469545afe', '8a266dbf-855d-4fac-a44a-635bd3978f55', '4ed557a5-4c8d-437d-a408-d559a957598e', 4, 'Sẽ ủng hộ shop tiếp!', '\"[]\"', 0, '2025-12-04 04:26:21.774', '2025-12-04 04:26:21.774'),
('0d2e0fb4-7173-4163-8969-63b2870d4ed3', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'af140299-9618-4176-8a77-445fd10caaf1', 4, 'Dịch vụ tốt, nhiệt tình.', '\"[]\"', 0, '2025-12-04 04:26:21.784', '2025-12-04 04:26:21.784'),
('206477d1-0106-488e-9584-c0c7c86a6e9e', '8a266dbf-855d-4fac-a44a-635bd3978f55', '46a05e1b-80cd-4e0f-8f4e-a9adbf053e90', 4, 'Rất thích, sẽ giới thiệu cho bạn bè.', '\"[]\"', 0, '2025-12-04 04:26:21.779', '2025-12-04 04:26:21.779'),
('461da459-79c6-4ce4-9468-cca57554c074', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', '0996f5ca-1cf1-4e37-9c12-59b853d79929', 5, 'Hoa đúng như hình, rất hài lòng!', '\"[]\"', 0, '2025-12-04 04:26:21.793', '2025-12-04 04:26:21.793'),
('4632a718-898f-4e08-8e68-8acf93f0f323', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'feffb436-b8e5-4c9e-905b-4ff063980376', 5, 'Hoa thơm và đẹp mắt.', '\"[]\"', 0, '2025-12-04 04:26:21.782', '2025-12-04 04:26:21.782'),
('61fdc451-4398-4bc0-96a7-edceac9df967', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'f01fea94-292f-4da4-bc7f-3a5e57f1bf79', 4, 'Chất lượng tốt, đóng gói cẩn thận.', '\"[]\"', 0, '2025-12-04 04:26:21.790', '2025-12-04 04:26:21.790'),
('8ccba12c-0d59-4166-84f4-3ea37a45bcf1', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'fa553528-ccd1-4d52-b21f-0f69fa39222b', 4, 'Giá hơi cao nhưng chất lượng xứng đáng.', '\"[]\"', 0, '2025-12-04 04:26:21.771', '2025-12-04 04:26:21.771'),
('9c7da1c1-51cf-4f29-9d9a-145b73a115b2', '8a266dbf-855d-4fac-a44a-635bd3978f55', '19fb461f-3353-4717-9da0-e7bef72aae11', 4, 'Ship nhanh, hoa tươi lâu.', '\"[]\"', 0, '2025-12-04 04:26:21.769', '2025-12-04 04:26:21.769'),
('aed92b7d-7da1-41e4-8fc3-07622be91f78', '8a266dbf-855d-4fac-a44a-635bd3978f55', '02df2eba-61b2-4ad3-9f9f-5993f475f986', 5, 'Chất lượng tốt, đóng gói cẩn thận.', '\"[]\"', 0, '2025-12-04 04:26:21.765', '2025-12-04 04:26:21.765'),
('b7e6a256-ff51-462d-b8ba-4fb133249013', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', '79dcbd9f-e9c3-482f-ac0a-92cb56a5a22e', 4, 'Hoa rất đẹp và tươi! Giao hàng nhanh chóng.', '\"[]\"', 0, '2025-12-04 04:26:21.762', '2025-12-04 04:26:21.762'),
('badf6a25-25dd-47ea-b6e0-c26749d6b9f8', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'feffb436-b8e5-4c9e-905b-4ff063980376', 4, 'Hoa đẹp nhưng ship hơi lâu.', '\"[]\"', 0, '2025-12-04 04:26:21.776', '2025-12-04 04:26:21.776'),
('bd6cb138-0daf-4639-858a-d2a45462b112', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', '176a420d-501f-4c48-a262-95a32324ade0', 5, 'Giá hơi cao nhưng chất lượng xứng đáng.', '\"[]\"', 0, '2025-12-04 04:26:21.798', '2025-12-04 04:26:21.798'),
('cbba3511-95c4-4ca6-9376-c953f90a34d8', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', '91eea9cd-5742-4e95-8836-fb94690b4d1f', 4, 'Hoa đúng như hình, rất hài lòng!', '\"[]\"', 0, '2025-12-04 04:26:21.767', '2025-12-04 04:26:21.767'),
('d60de872-eda2-4a9b-8a71-94c3d15e12e0', '8a266dbf-855d-4fac-a44a-635bd3978f55', '3f766ccd-269a-40f8-a64b-afd6ab2e3ebc', 5, 'Ship nhanh, hoa tươi lâu.', '\"[]\"', 0, '2025-12-04 04:26:21.795', '2025-12-04 04:26:21.795'),
('db09c407-b774-4ab2-8d71-14796fe9bbc7', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', '46a05e1b-80cd-4e0f-8f4e-a9adbf053e90', 4, 'Hoa rất đẹp và tươi! Giao hàng nhanh chóng.', '\"[]\"', 0, '2025-12-04 04:26:21.787', '2025-12-04 04:26:21.787');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `avatar` varchar(191) DEFAULT NULL,
  `fullname` varchar(191) NOT NULL,
  `birthday` datetime(3) DEFAULT NULL,
  `gender` varchar(191) DEFAULT NULL,
  `role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
  `resetToken` varchar(191) DEFAULT NULL,
  `resetTokenExpires` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `phone`, `password`, `avatar`, `fullname`, `birthday`, `gender`, `role`, `resetToken`, `resetTokenExpires`, `createdAt`, `updatedAt`) VALUES
('04f17b7c-4314-4222-997c-e1eaf94b9f0a', 'a1@a.com', '0123456783', '$2b$10$2Tm.K8/sgYN2ybHwaIKvEu89IhJy5YI/l4kPM92yXzYvL5u8yDkXa', NULL, 'abcd', NULL, NULL, 'USER', NULL, NULL, '2025-12-04 17:49:21.803', '2025-12-04 17:49:21.803'),
('25d7108f-fbaf-49d2-8d63-b690131a5b84', 'ae123@123ae.com', '1212121212', '$2b$10$7MjLCKVAf.8kljVy.vJMoO/aJ54lgMYRS.M8NC8pUJpHsjmeSNHpC', NULL, 'ae123', NULL, NULL, 'USER', NULL, NULL, '2025-12-04 17:53:22.433', '2025-12-04 17:53:22.433'),
('4025bffc-3e10-4afc-9874-14804cf123ea', 'admin@hoashop.com', '0901234567', '$2b$10$HHEVb7e1p92t7Bhe0Pf5g.rtc4Ze3B5WuSe.JU2ZF6vAT2m51vYDG', '/uploads/hoashop/users/1764863797255-980572c08f87c062.jpeg', 'Admin HoaShop', NULL, NULL, 'ADMIN', NULL, NULL, '2025-12-04 04:24:46.567', '2025-12-04 15:56:37.360'),
('7a8b5715-7fb5-4b5a-a52d-215a0ace5a98', 'a@a.com', '0123456782', '$2b$10$z/C/eErnt0DlLZFok4ZuMueDRpZQ6dMwnMLjicpIEaDBNCKpkrGCW', NULL, 'abc', NULL, NULL, 'USER', NULL, NULL, '2025-12-04 17:48:13.291', '2025-12-04 17:48:13.291'),
('8a266dbf-855d-4fac-a44a-635bd3978f55', 'user2@hoashop.com', '0923456789', '$2b$10$WfiTQAn0oHcUgrAmQPlWF.0/0hWWoR3dX/T3i8tJ/Z.1pa7.Zfh.C', 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=ec4899&color=fff', 'Trần Thị B', '1995-05-20 00:00:00.000', 'female', 'USER', NULL, NULL, '2025-12-04 04:24:46.744', '2025-12-04 04:24:46.744'),
('902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'user@hoashop.com', '0912345678', '$2b$10$EYV/cIb.0AnwetwszB8KXeuv5qng50tO.tCkXNg9WccFV/qBhenx.', 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3b82f6&color=fff', 'Nguyễn Văn A', '1990-01-15 00:00:00.000', 'male', 'USER', NULL, NULL, '2025-12-04 04:24:46.657', '2025-12-04 04:24:46.657'),
('95b25b46-7fe7-4e04-aa76-d32d52bb2163', 'letanlochhgg@gmail.com', '0123456781', '$2b$10$auyi1j4ZR5zEXN6WyXRe9Op8mZLBl7Ec8Ce.4e.x3UZKqGTIsaBfe', NULL, 'Leloc', NULL, NULL, 'USER', NULL, NULL, '2025-12-04 13:17:42.196', '2025-12-04 13:17:42.196'),
('c7ff2267-8961-403a-b05e-0a12aa3f8adb', 'a@11a.com', '0909090909', '$2b$10$464ArJWd0K208GZOjtCvG.yLN3PM0.G/.nWvnbVcE7bU2FcIY66ua', NULL, 'a1234', NULL, NULL, 'USER', NULL, NULL, '2025-12-04 17:51:29.588', '2025-12-04 17:51:29.588'),
('d4711ef5-70c2-4f92-9d06-76f843510daa', 'ae456@456ae.com', '1212121214', '$2b$10$haKVR8uNSMoVVxYhJfW33Oa3XILxS7VQheCKrBimaxOzbCYsV7tdW', NULL, 'ae456', NULL, NULL, 'USER', NULL, NULL, '2025-12-04 17:54:41.931', '2025-12-04 17:54:41.931'),
('dab79567-ec4d-4aaa-b2af-d975b600d59f', 'leloc@gmail.com', '0987654321', '$2b$10$tRPldqtp5bQXztcouDW87OC8MQRV4q74po4WZVEi9d2y8Ptjo5cSy', NULL, 'le', NULL, NULL, 'USER', NULL, NULL, '2025-12-04 17:44:46.923', '2025-12-04 17:44:46.923'),
('ddaa06cd-6043-4dff-9d4b-224a7668a4f0', 'a23@a.com', '1231231231', '$2b$10$e.sgiaZ0wq3xlnxgG5ab6eHbw8P9skt44Kec60A.sEKAS2/18aKtS', NULL, 'abc2', NULL, NULL, 'USER', NULL, NULL, '2025-12-04 17:49:55.039', '2025-12-04 17:49:55.039');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `vouchers`
--

CREATE TABLE `vouchers` (
  `id` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('PERCENTAGE','FIXED') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `minOrder` decimal(10,2) DEFAULT NULL,
  `maxDiscount` decimal(10,2) DEFAULT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `used` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `vouchers`
--

INSERT INTO `vouchers` (`id`, `code`, `description`, `type`, `value`, `minOrder`, `maxDiscount`, `startDate`, `endDate`, `quantity`, `used`, `isActive`, `createdAt`, `updatedAt`) VALUES
('248c6202-51ca-43ef-9bd6-d6bc8b57a144', 'SUMMER2024', 'Giảm 20% cho mùa hè', 'PERCENTAGE', 20.00, 200000.00, 100000.00, '2024-06-01 00:00:00.000', '2025-08-31 00:00:00.000', 100, 5, 1, '2025-12-04 04:24:47.087', '2025-12-04 04:24:47.087'),
('7aff6279-69a4-478d-8c94-11ad4509e4e1', 'NEWYEAR2025', 'Giảm 50K cho năm mới', 'FIXED', 50000.00, 300000.00, 50000.00, '2025-01-01 00:00:00.000', '2025-12-31 00:00:00.000', 200, 10, 1, '2025-12-04 04:24:47.092', '2025-12-04 04:24:47.092'),
('faf5a720-fbe4-4790-8518-c059416de302', 'FIRSTORDER', 'Giảm 15% cho đơn đầu tiên', 'PERCENTAGE', 15.00, 150000.00, 75000.00, '2024-01-01 00:00:00.000', '2025-12-31 00:00:00.000', 500, 57, 1, '2025-12-04 04:24:47.095', '2025-12-04 14:33:39.467');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wishlists`
--

CREATE TABLE `wishlists` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `wishlists`
--

INSERT INTO `wishlists` (`id`, `userId`, `productId`, `createdAt`) VALUES
('0d9af370-f16f-4d9e-a9a5-488238f49c9c', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'f01fea94-292f-4da4-bc7f-3a5e57f1bf79', '2025-12-04 04:26:21.803'),
('1174e041-726e-41bf-99fa-c927893ec24f', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'af140299-9618-4176-8a77-445fd10caaf1', '2025-12-04 04:26:21.803'),
('1435c38c-a488-4731-90db-1694e51bf649', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'f6e5bed3-313e-4e82-8598-29bdb600d5e8', '2025-12-04 04:26:21.803'),
('261e9313-fef7-42d5-9b1b-1b9ed04e983b', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'c8fc99a7-6d9e-4a45-ba7e-18bb7174c494', '2025-12-04 04:26:21.803'),
('396b02b4-77ec-46b1-bb05-38a67a8fd9ec', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'da18def5-075a-484e-9fe7-f03490f2df78', '2025-12-04 04:26:21.803'),
('41121639-d9f4-4f0a-811b-9547d4f600d2', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', 'a92160d2-cda6-451f-a10b-5833278d64d6', '2025-12-04 04:26:21.803'),
('45670c66-9224-43f3-9f27-35a092e72b0f', '4025bffc-3e10-4afc-9874-14804cf123ea', '02df2eba-61b2-4ad3-9f9f-5993f475f986', '2025-12-04 10:56:03.854'),
('4ac56f07-0090-4cb7-96c8-99f9355cfc0f', '4025bffc-3e10-4afc-9874-14804cf123ea', '46a05e1b-80cd-4e0f-8f4e-a9adbf053e90', '2025-12-04 16:18:07.899'),
('4ffcbf15-2d41-4921-aa3b-cd4fb58e0d44', '4025bffc-3e10-4afc-9874-14804cf123ea', '44594029-f34a-4532-bbe5-d07ce2013b35', '2025-12-04 10:56:43.867'),
('5f89a87c-689a-4d6a-9ae7-0ad7d0b7bbae', '4025bffc-3e10-4afc-9874-14804cf123ea', '91eea9cd-5742-4e95-8836-fb94690b4d1f', '2025-12-04 16:14:21.475'),
('75ec90ca-e130-4590-a42c-e2b071b63e02', '8a266dbf-855d-4fac-a44a-635bd3978f55', 'a93683b0-2ea0-4045-a7ca-8a6dfdaeb483', '2025-12-04 04:26:21.803'),
('bcde3ba1-772d-46d4-90e3-8f8554841f89', '8a266dbf-855d-4fac-a44a-635bd3978f55', '8b1d83db-f26f-442c-ae87-4c050eb5dd01', '2025-12-04 04:26:21.803'),
('d4a2b497-2fb1-4f00-bc8e-f9013a48b0b1', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', '4c469fe1-d7ff-4fc7-ad6c-5cf85899c00d', '2025-12-04 04:26:21.803'),
('d8a860cd-4f76-47b2-abdf-3a0d29eb2590', '4025bffc-3e10-4afc-9874-14804cf123ea', '4ed557a5-4c8d-437d-a408-d559a957598e', '2025-12-06 07:45:25.870'),
('dff29b52-032d-4ef5-8ee2-b3136a1cc768', '902ac3d0-d16f-4c82-834f-cf3f3b7f8ff3', '176a420d-501f-4c48-a262-95a32324ade0', '2025-12-04 04:26:21.803'),
('f69847cc-ee63-4e8c-81fc-201c96877e11', '4025bffc-3e10-4afc-9874-14804cf123ea', '19fb461f-3353-4717-9da0-e7bef72aae11', '2025-12-04 10:59:22.150');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `addresses_userId_fkey` (`userId`);

--
-- Chỉ mục cho bảng `admin_replies`
--
ALTER TABLE `admin_replies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admin_replies_reviewId_key` (`reviewId`);

--
-- Chỉ mục cho bảng `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_key` (`slug`),
  ADD KEY `categories_parentId_fkey` (`parentId`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_userId_idx` (`userId`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_orderId_idx` (`orderId`),
  ADD KEY `order_items_variantId_idx` (`variantId`);

--
-- Chỉ mục cho bảng `order_receivers`
--
ALTER TABLE `order_receivers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_receivers_orderId_key` (`orderId`);

--
-- Chỉ mục cho bảng `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_orderId_key` (`orderId`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_key` (`slug`),
  ADD KEY `products_categoryId_idx` (`categoryId`);

--
-- Chỉ mục cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_variants_productId_idx` (`productId`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviews_userId_idx` (`userId`),
  ADD KEY `reviews_productId_idx` (`productId`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_phone_key` (`phone`),
  ADD UNIQUE KEY `users_resetToken_key` (`resetToken`);

--
-- Chỉ mục cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vouchers_code_key` (`code`);

--
-- Chỉ mục cho bảng `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wishlists_userId_productId_key` (`userId`,`productId`),
  ADD KEY `wishlists_userId_idx` (`userId`),
  ADD KEY `wishlists_productId_idx` (`productId`);

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `admin_replies`
--
ALTER TABLE `admin_replies`
  ADD CONSTRAINT `admin_replies_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `order_receivers`
--
ALTER TABLE `order_receivers`
  ADD CONSTRAINT `order_receivers_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wishlists_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
