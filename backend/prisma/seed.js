const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Users
  console.log('👤 Creating users...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hoashop.com' },
    update: {},
    create: {
      email: 'admin@hoashop.com',
      password: await hashPassword('admin123'),
      fullname: 'Admin HoaShop',
      phone: '0901234567',
      role: 'ADMIN',
      avatar: 'https://ui-avatars.com/api/?name=Admin+HoaShop&background=ef4444&color=fff',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'user@hoashop.com' },
    update: {},
    create: {
      email: 'user@hoashop.com',
      password: await hashPassword('password123'),
      fullname: 'Nguyễn Văn A',
      phone: '0912345678',
      birthday: new Date('1990-01-15'),
      gender: 'male',
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3b82f6&color=fff',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@hoashop.com' },
    update: {},
    create: {
      email: 'user2@hoashop.com',
      password: await hashPassword('password123'),
      fullname: 'Trần Thị B',
      phone: '0923456789',
      birthday: new Date('1995-05-20'),
      gender: 'female',
      avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=ec4899&color=fff',
    },
  });

  // 2. Create Addresses
  console.log('📍 Creating addresses...');
  const existingAddresses = await prisma.address.count();
  if (existingAddresses === 0) {
    await prisma.address.createMany({
      data: [
        {
          userId: user1.id,
          title: 'Nhà riêng',
          fullAddress: '123 Nguyễn Trãi',
          ward: 'Phường Bến Thành',
          district: 'Quận 1',
          province: 'TP. Hồ Chí Minh',
          phoneReceiver: '0912345678',
          nameReceiver: 'Nguyễn Văn A',
          isDefault: true,
        },
        {
          userId: user1.id,
          title: 'Công ty',
          fullAddress: '456 Lê Lợi',
          ward: 'Phường Bến Nghé',
          district: 'Quận 1',
          province: 'TP. Hồ Chí Minh',
          phoneReceiver: '0912345678',
          nameReceiver: 'Nguyễn Văn A',
          isDefault: false,
        },
        {
          userId: user2.id,
          title: 'Nhà riêng',
          fullAddress: '789 Hai Bà Trưng',
          ward: 'Phường Đa Kao',
          district: 'Quận 1',
          province: 'TP. Hồ Chí Minh',
          phoneReceiver: '0923456789',
          nameReceiver: 'Trần Thị B',
          isDefault: true,
        },
      ],
    });
  }

  // 3. Create Categories
  console.log('📁 Creating categories...');
  const catSinhNhat = await prisma.category.upsert({
    where: { slug: 'hoa-sinh-nhat' },
    update: {},
    create: {
      name: 'Hoa Sinh Nhật',
      slug: 'hoa-sinh-nhat',
      description: 'Các loại hoa dành cho sinh nhật',
      image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500',
    },
  });

  const catTinhYeu = await prisma.category.upsert({
    where: { slug: 'hoa-tinh-yeu' },
    update: {},
    create: {
      name: 'Hoa Tình Yêu',
      slug: 'hoa-tinh-yeu',
      description: 'Hoa tặng người yêu',
      image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=500',
    },
  });

  const catChucMung = await prisma.category.upsert({
    where: { slug: 'hoa-chuc-mung' },
    update: {},
    create: {
      name: 'Hoa Chúc Mừng',
      slug: 'hoa-chuc-mung',
      description: 'Hoa chúc mừng khai trương, thăng chức',
      image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500',
    },
  });

  const catChiaBuon = await prisma.category.upsert({
    where: { slug: 'hoa-chia-buon' },
    update: {},
    create: {
      name: 'Hoa Chia Buồn',
      slug: 'hoa-chia-buon',
      description: 'Hoa chia buồn, tang lễ',
      image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=500',
    },
  });

  // 4. Create Products
  console.log('🌹 Creating products...');
  
  // Helper function to get random image
  const getRandomImage = () => {
    const imageNum = Math.floor(Math.random() * 12) + 1;
    return `/uploads/hoashop/products/hoa${imageNum}.jpg`;
  };

  const productData = [
    { title: 'Bó Hoa Hồng Đỏ Tình Yêu', slug: 'bo-hoa-hong-do-tinh-yeu', category: catTinhYeu, desc: 'Bó hoa hồng đỏ Ecuador cao cấp, thể hiện tình yêu nồng cháy' },
    { title: 'Bó Tulip Sinh Nhật Sang Trọng', slug: 'bo-tulip-sinh-nhat', category: catSinhNhat, desc: 'Bó tulip Hà Lan nhập khẩu, màu sắc tươi sáng' },
    { title: 'Giỏ Lan Hồ Điệp Chúc Mừng', slug: 'gio-lan-ho-diep-chuc-mung', category: catChucMung, desc: 'Giỏ lan hồ điệp sang trọng, thích hợp khai trương' },
    { title: 'Bó Hướng Dương Tươi Sáng', slug: 'bo-huong-duong-tuoi-sang', category: catSinhNhat, desc: 'Bó hướng dương rực rỡ, mang đến niềm vui' },
    { title: 'Hoa Hồng Trắng Tinh Khôi', slug: 'hoa-hong-trang-tinh-khoi', category: catTinhYeu, desc: 'Hoa hồng trắng thuần khiết, tượng trưng tình yêu trong sáng' },
    { title: 'Bó Cẩm Chướng Ngọt Ngào', slug: 'bo-cam-chuong-ngot-ngao', category: catSinhNhat, desc: 'Cẩm chướng nhiều màu sắc, dễ thương và đáng yêu' },
    { title: 'Giỏ Hoa Chúc Mừng Khai Trương', slug: 'gio-hoa-chuc-mung-khai-truong', category: catChucMung, desc: 'Giỏ hoa chúc mừng sang trọng, thể hiện sự thịnh vượng' },
    { title: 'Hoa Ly Trắng Cao Quý', slug: 'hoa-ly-trang-cao-quy', category: catChiaBuon, desc: 'Hoa ly trắng thanh lịch, trang nghiêm' },
    { title: 'Bó Hoa Baby Mix Pastel', slug: 'bo-hoa-baby-mix-pastel', category: catSinhNhat, desc: 'Bó hoa baby pastel nhẹ nhàng, dễ thương' },
    { title: 'Hoa Hồng Phớt Ngọt Ngào', slug: 'hoa-hong-phot-ngot-ngao', category: catTinhYeu, desc: 'Hoa hồng màu hồng phớt, lãng mạn và ngọt ngào' },
    { title: 'Kệ Hoa Chia Buồn Tang Lễ', slug: 'ke-hoa-chia-buon-tang-le', category: catChiaBuon, desc: 'Kệ hoa chia buồn trang nghiêm, thành kính' },
    { title: 'Bó Hoa Cầu Vồng Rực Rỡ', slug: 'bo-hoa-cau-vong-ruc-ro', category: catSinhNhat, desc: 'Bó hoa đa màu sắc như cầu vồng, tươi vui' },
    { title: 'Hộp Hoa Hồng Cao Cấp', slug: 'hop-hoa-hong-cao-cap', category: catTinhYeu, desc: 'Hộp hoa hồng đỏ trong hộp sang trọng' },
    { title: 'Giỏ Hoa Tulip Hà Lan', slug: 'gio-hoa-tulip-ha-lan', category: catSinhNhat, desc: 'Giỏ tulip nhập khẩu Hà Lan cao cấp' },
    { title: 'Lan Hồ Điệp 5 Cành Trắng', slug: 'lan-ho-diep-5-canh-trang', category: catChucMung, desc: 'Chậu lan hồ điệp trắng 5 cành sang trọng' },
    { title: 'Bó Hoa Cúc Tana Tím', slug: 'bo-hoa-cuc-tana-tim', category: catSinhNhat, desc: 'Cúc tana màu tím pastel xinh xắn' },
    { title: 'Hoa Đồng Tiền Vàng May Mắn', slug: 'hoa-dong-tien-vang-may-man', category: catChucMung, desc: 'Hoa đồng tiền vàng tượng trưng tài lộc' },
    { title: 'Bó Hoa Cát Tường Lavender', slug: 'bo-hoa-cat-tuong-lavender', category: catTinhYeu, desc: 'Cát tường màu lavender nhẹ nhàng thơ mộng' },
    { title: 'Kệ Hoa Khai Trương 3 Tầng', slug: 'ke-hoa-khai-truong-3-tang', category: catChucMung, desc: 'Kệ hoa khai trương 3 tầng hoành tráng' },
    { title: 'Hoa Hồng Juliet Garden', slug: 'hoa-hong-juliet-garden', category: catTinhYeu, desc: 'Hoa hồng Juliet Garden cao cấp nhập khẩu' },
    { title: 'Bó Hoa Mẫu Đơn Sang Trọng', slug: 'bo-hoa-mau-don-sang-trong', category: catSinhNhat, desc: 'Hoa mẫu đơn quý phái và sang trọng' },
    { title: 'Giỏ Hoa Hồng Pastel Mix', slug: 'gio-hoa-hong-pastel-mix', category: catTinhYeu, desc: 'Giỏ hoa hồng pastel mix nhẹ nhàng' },
    { title: 'Hoa Cúc Họa Mi Trắng Tinh Khôi', slug: 'hoa-cuc-hoa-mi-trang', category: catChiaBuon, desc: 'Cúc họa mi trắng thanh khiết, trang nghiêm' },
    { title: 'Bó Hoa Lavender Provence', slug: 'bo-hoa-lavender-provence', category: catSinhNhat, desc: 'Hoa lavender Provence thơm dịu nhẹ' },
    { title: 'Lan Vàng Kim Hoàng Hậu', slug: 'lan-vang-kim-hoang-hau', category: catChucMung, desc: 'Lan vàng kim hoàng hậu sang trọng' },
    { title: 'Hoa Hồng Ecuador Premium', slug: 'hoa-hong-ecuador-premium', category: catTinhYeu, desc: 'Hoa hồng Ecuador size XXL cao cấp nhất' },
    { title: 'Bó Hoa Xanh Blue Charm', slug: 'bo-hoa-xanh-blue-charm', category: catSinhNhat, desc: 'Bó hoa tông xanh dương độc đáo' },
    { title: 'Giỏ Hoa Sinh Nhật Sweet 18', slug: 'gio-hoa-sinh-nhat-sweet-18', category: catSinhNhat, desc: 'Giỏ hoa sinh nhật tuổi 18 đặc biệt' },
    { title: 'Hộp Hoa Sáp Bất Tử', slug: 'hop-hoa-sap-bat-tu', category: catTinhYeu, desc: 'Hoa sáp handmade bền đẹp lâu năm' },
    { title: 'Kệ Hoa Chia Buồn Cao Cấp', slug: 'ke-hoa-chia-buon-cao-cap', category: catChiaBuon, desc: 'Kệ hoa chia buồn 2 tầng cao cấp' },
  ];

  const products = [];
  for (let i = 0; i < productData.length; i++) {
    const data = productData[i];
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        title: data.title,
        slug: data.slug,
        description: data.desc,
        images: [getRandomImage(), getRandomImage()],
        categoryId: data.category.id,
        metaTitle: data.title,
        metaDescription: data.desc,
        isActive: true,
      },
    });
    products.push(product);
  }

  // 6. Create Product Variants
  console.log('📏 Creating product variants...');
  
  const existingVariants = await prisma.productVariant.count();
  if (existingVariants === 0) {
    const prices = [
      { S: 300000, M: 500000, L: 800000 },
      { S: 250000, M: 450000, L: 700000 },
      { S: 350000, M: 600000, L: 950000 },
      { S: 280000, M: 480000, L: 750000 },
      { S: 320000, M: 550000, L: 850000 },
    ];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const priceSet = prices[i % prices.length];
      
      // Size S
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          size: 'S',
          price: priceSet.S,
          description: 'Size nhỏ - 10-15 bông',
          stock: Math.floor(Math.random() * 30) + 20, // 20-50
          isActive: true,
        },
      });

      // Size M
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          size: 'M',
          price: priceSet.M,
          description: 'Size vừa - 20-25 bông',
          stock: Math.floor(Math.random() * 30) + 20, // 20-50
          isActive: true,
        },
      });

      // Size L
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          size: 'L',
          price: priceSet.L,
          description: 'Size lớn - 30-40 bông',
          stock: Math.floor(Math.random() * 20) + 10, // 10-30
          isActive: true,
        },
      });
    }
  } else {
    console.log('  - Variants already exist, skipping...');
  }

  // 7. Create Vouchers
  console.log('🎟️ Creating vouchers...');
  await prisma.voucher.upsert({
    where: { code: 'SUMMER2024' },
    update: {},
    create: {
      code: 'SUMMER2024',
      description: 'Giảm 20% cho mùa hè',
      type: 'PERCENTAGE',
      value: 20,
      minOrder: 200000,
      maxDiscount: 100000,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-08-31'),
      quantity: 100,
      used: 5,
      isActive: true,
    },
  });

  await prisma.voucher.upsert({
    where: { code: 'NEWYEAR2025' },
    update: {},
    create: {
      code: 'NEWYEAR2025',
      description: 'Giảm 50K cho năm mới',
      type: 'FIXED',
      value: 50000,
      minOrder: 300000,
      maxDiscount: 50000,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      quantity: 200,
      used: 10,
      isActive: true,
    },
  });

  await prisma.voucher.upsert({
    where: { code: 'FIRSTORDER' },
    update: {},
    create: {
      code: 'FIRSTORDER',
      description: 'Giảm 15% cho đơn đầu tiên',
      type: 'PERCENTAGE',
      value: 15,
      minOrder: 150000,
      maxDiscount: 75000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      quantity: 500,
      used: 50,
      isActive: true,
    },
  });

  // 9. Create Banners
  console.log('🖼️ Creating banners...');
  await prisma.banner.upsert({
    where: { id: 'banner-1' },
    update: {},
    create: {
      id: 'banner-1',
      title: 'Khuyến mãi mùa hè 2024',
      image: '/uploads/hoashop/products/banner1.jpg',
      link: '/products',
      description: 'Giảm giá đến 20% cho tất cả sản phẩm',
      order: 1,
      isActive: true,
    },
  });

  await prisma.banner.upsert({
    where: { id: 'banner-2' },
    update: {},
    create: {
      id: 'banner-2',
      title: 'Hoa tình yêu - Gửi trọn yêu thương',
      image: '/uploads/hoashop/products/banner2.jpg',
      link: '/products?category=hoa-tinh-yeu',
      description: 'Bộ sưu tập hoa tặng người yêu',
      order: 2,
      isActive: true,
    },
  });

  await prisma.banner.upsert({
    where: { id: 'banner-3' },
    update: {},
    create: {
      id: 'banner-3',
      title: 'Hoa cao cấp - Sang trọng đẳng cấp',
      image: '/uploads/hoashop/products/banner3.jpg',
      link: '/products?category=hoa-chuc-mung',
      description: 'Bộ sưu tập hoa cao cấp nhất',
      order: 3,
      isActive: true,
    },
  });

  // 10. Create Sample Orders
  console.log('📦 Creating sample orders...');
  
  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    const allVariants = await prisma.productVariant.findMany();
    const users = [user1, user2];
    const statuses = ['PENDING', 'CONFIRMED', 'DELIVERING', 'COMPLETED', 'CANCELLED'];
    const paymentMethods = ['COD', 'BANK_TRANSFER', 'VNPAY'];
    const addresses = [
      '123 Nguyễn Trãi, Q.1, TP.HCM',
      '456 Lê Lợi, Q.3, TP.HCM',
      '789 Hai Bà Trưng, Q.1, TP.HCM',
      '321 Cách Mạng Tháng 8, Q.10, TP.HCM',
      '654 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
    ];

    for (let i = 0; i < 20; i++) {
      const user = users[i % users.length];
      const variant = allVariants[Math.floor(Math.random() * allVariants.length)];
      const quantity = Math.floor(Math.random() * 2) + 1; // 1-2
      const total = variant.price * quantity;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const paymentStatus = status === 'COMPLETED' ? 'PAID' : (status === 'CANCELLED' ? 'FAILED' : 'PENDING');

      await prisma.order.create({
        data: {
          userId: user.id,
          status: status,
          total: total,
          note: i % 3 === 0 ? 'Giao hàng cẩn thận' : '',
          messageCard: i % 2 === 0 ? 'Chúc mừng sinh nhật!' : '',
          senderType: i % 2 === 0 ? 'NAMED' : 'ANONYMOUS',
          receiver: {
            create: {
              name: `Người nhận ${i + 1}`,
              phone: `09${String(i).padStart(8, '0')}`,
              address: addresses[i % addresses.length],
              deliveryDate: new Date(Date.now() + (i * 86400000)), // Spread over days
              deliverySlot: i % 2 === 0 ? '8-10h' : '14-16h',
            },
          },
          items: {
            create: {
              variantId: variant.id,
              quantity: quantity,
              price: variant.price,
              addons: JSON.stringify([]),
            },
          },
          payment: {
            create: {
              method: paymentMethod,
              amount: total,
              status: paymentStatus,
            },
          },
        },
      });
    }
  } else {
    console.log('  - Orders already exist, skipping...');
  }

  // 11. Create Reviews
  console.log('⭐ Creating reviews...');
  const existingReviews = await prisma.review.count();
  if (existingReviews === 0) {
    const reviewComments = [
      'Hoa rất đẹp và tươi! Giao hàng nhanh chóng.',
      'Chất lượng tốt, đóng gói cẩn thận.',
      'Hoa đúng như hình, rất hài lòng!',
      'Ship nhanh, hoa tươi lâu.',
      'Giá hơi cao nhưng chất lượng xứng đáng.',
      'Sẽ ủng hộ shop tiếp!',
      'Hoa đẹp nhưng ship hơi lâu.',
      'Rất thích, sẽ giới thiệu cho bạn bè.',
      'Hoa thơm và đẹp mắt.',
      'Dịch vụ tốt, nhiệt tình.',
    ];

    for (let i = 0; i < 15; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const user = i % 2 === 0 ? user1 : user2;
      const rating = Math.floor(Math.random() * 2) + 4; // 4-5
      
      await prisma.review.create({
        data: {
          userId: user.id,
          productId: product.id,
          rating: rating,
          comment: reviewComments[i % reviewComments.length],
          images: JSON.stringify([]),
          isHidden: false,
        },
      });
    }
  } else {
    console.log('  - Reviews already exist, skipping...');
  }

  // 12. Create Wishlist
  console.log('❤️ Creating wishlists...');
  const existingWishlists = await prisma.wishlist.count();
  if (existingWishlists === 0) {
    const wishlistData = [];
    for (let i = 0; i < 10; i++) {
      wishlistData.push({
        userId: i % 2 === 0 ? user1.id : user2.id,
        productId: products[i % products.length].id,
      });
    }
    await prisma.wishlist.createMany({ data: wishlistData });
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- Users: 3 (1 admin, 2 customers)');
  console.log('- Categories: 4');
  console.log('- Products: 30');
  console.log('- Variants: 90 (3 per product)');
  console.log('- Vouchers: 3');
  console.log('- Banners: 3');
  console.log('- Orders: 20');
  console.log('- Reviews: 15');
  console.log('- Wishlists: 10');
  console.log('\n🔑 Test Accounts:');
  console.log('Admin: admin@hoashop.com / admin123');
  console.log('User 1: user@hoashop.com / password123');
  console.log('User 2: user2@hoashop.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
