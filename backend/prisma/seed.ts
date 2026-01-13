import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
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
    skipDuplicates: true,
  });

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

  const catChiaUy = await prisma.category.upsert({
    where: { slug: 'hoa-chia-buon' },
    update: {},
    create: {
      name: 'Hoa Chia Buồn',
      slug: 'hoa-chia-buon',
      description: 'Hoa chia buồn, tang lễ',
      image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=500',
    },
  });

  // 4. Create FlowerLibrary
  console.log('🌺 Creating flower library...');
  
  // Check if flowers already exist
  const existingFlowers = await prisma.flowerLibrary.findMany();
  let hoaHongDo, hoaHongTrang, hoaTulip, hoaCamChuong, hoaLan, hoaHuongDuong;

  if (existingFlowers.length === 0) {
    hoaHongDo = await prisma.flowerLibrary.create({
      data: {
        name: 'Hoa Hồng Đỏ Ecuador',
        description: 'Hoa hồng đỏ cao cấp nhập khẩu từ Ecuador',
        image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=300',
        price: 50000,
        unit: 'cành',
      },
    });

    hoaHongTrang = await prisma.flowerLibrary.create({
      data: {
        name: 'Hoa Hồng Trắng',
        description: 'Hoa hồng trắng tinh khôi',
        image: 'https://images.unsplash.com/photo-1535368459588-e37e98d2e139?w=300',
        price: 40000,
        unit: 'cành',
      },
    });

    hoaTulip = await prisma.flowerLibrary.create({
      data: {
        name: 'Hoa Tulip Hà Lan',
        description: 'Tulip nhập khẩu Hà Lan',
        image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=300',
        price: 60000,
        unit: 'cành',
      },
    });

    hoaCamChuong = await prisma.flowerLibrary.create({
      data: {
        name: 'Hoa Cẩm Chướng',
        description: 'Cẩm chướng nhiều màu',
        image: 'https://images.unsplash.com/photo-1589988223540-a0c9284a86fd?w=300',
        price: 30000,
        unit: 'cành',
      },
    });

    hoaLan = await prisma.flowerLibrary.create({
      data: {
        name: 'Hoa Lan Hồ Điệp',
        description: 'Lan hồ điệp cao cấp',
        image: 'https://images.unsplash.com/photo-1533045971331-d9664dcdee86?w=300',
        price: 80000,
        unit: 'cành',
      },
    });

    hoaHuongDuong = await prisma.flowerLibrary.create({
      data: {
        name: 'Hoa Hướng Dương',
        description: 'Hướng dương tươi sáng',
        image: 'https://images.unsplash.com/photo-1597848212624-e6099abe5a86?w=300',
        price: 35000,
        unit: 'cành',
      },
    });
  } else {
    console.log('  - Flowers already exist, reusing...');
    [hoaHongDo, hoaHongTrang, hoaTulip, hoaCamChuong, hoaLan, hoaHuongDuong] = existingFlowers;
  }

  // Create FlowerStock for all flowers
  console.log('📦 Creating flower stocks...');
  const flowers = [hoaHongDo, hoaHongTrang, hoaTulip, hoaCamChuong, hoaLan, hoaHuongDuong];
  for (const flower of flowers) {
    await prisma.flowerStock.upsert({
      where: { flowerId: flower.id },
      update: { quantity: 500 },
      create: {
        flowerId: flower.id,
        quantity: 500,
      },
    });
  }

  // 5. Create Products
  console.log('🌹 Creating products...');
  const product1 = await prisma.product.upsert({
    where: { slug: 'bo-hoa-hong-do-tinh-yeu' },
    update: {},
    create: {
      title: 'Bó Hoa Hồng Đỏ Tình Yêu',
      slug: 'bo-hoa-hong-do-tinh-yeu',
      description: 'Bó hoa hồng đỏ Ecuador cao cấp, thể hiện tình yêu nồng cháy. Mỗi bông hồng được chọn lọc kỹ càng, tươi mới và thơm ngát.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800',
        'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800',
      ]),
      categoryId: catTinhYeu.id,
      metaTitle: 'Bó Hoa Hồng Đỏ Tình Yêu',
      metaDescription: 'Hoa hồng đỏ tươi đẹp, thể hiện tình yêu nồng cháy',
      isActive: true,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { slug: 'bo-tulip-sinh-nhat' },
    update: {},
    create: {
      title: 'Bó Tulip Sinh Nhật Sang Trọng',
      slug: 'bo-tulip-sinh-nhat',
      description: 'Bó tulip Hà Lan nhập khẩu, màu sắc tươi sáng, phù hợp làm quà sinh nhật. Tulip tượng trưng cho tình yêu hoàn hảo và niềm vui.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800',
        'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800',
      ]),
      categoryId: catSinhNhat.id,
      metaTitle: 'Bó Tulip Sinh Nhật',
      metaDescription: 'Tulip Hà Lan cao cấp cho ngày sinh nhật',
      isActive: true,
    },
  });

  const product3 = await prisma.product.upsert({
    where: { slug: 'gio-lan-ho-diep-chuc-mung' },
    update: {},
    create: {
      title: 'Giỏ Lan Hồ Điệp Chúc Mừng',
      slug: 'gio-lan-ho-diep-chuc-mung',
      description: 'Giỏ lan hồ điệp sang trọng, thích hợp chúc mừng khai trương, thăng chức. Lan tượng trưng cho sự thịnh vượng và may mắn.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1533045971331-d9664dcdee86?w=800',
        'https://images.unsplash.com/photo-1452827073306-6e6e661baf57?w=800',
      ]),
      categoryId: catChucMung.id,
      metaTitle: 'Giỏ Lan Hồ Điệp Chúc Mừng',
      metaDescription: 'Lan hồ điệp cao cấp cho lễ khai trương',
      isActive: true,
    },
  });

  const product4 = await prisma.product.upsert({
    where: { slug: 'bo-huong-duong-tuoi-sang' },
    update: {},
    create: {
      title: 'Bó Hướng Dương Tươi Sáng',
      slug: 'bo-huong-duong-tuoi-sang',
      description: 'Bó hướng dương rực rỡ, mang đến niềm vui và năng lượng tích cực. Hướng dương tượng trưng cho sự lạc quan và hạnh phúc.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1597848212624-e6099abe5a86?w=800',
        'https://images.unsplash.com/photo-1471101173712-b9884175254e?w=800',
      ]),
      categoryId: catSinhNhat.id,
      metaTitle: 'Bó Hướng Dương',
      metaDescription: 'Hướng dương tươi đẹp mang niềm vui',
      isActive: true,
    },
  });

  // 6. Create Product Variants
  console.log('📏 Creating product variants...');
  const products = [product1, product2, product3, product4];
  for (const product of products) {
    // Size S
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        size: 'S',
        price: 300000,
        description: 'Size nhỏ - 10 bông',
        stock: 50,
        isActive: true,
      },
    });

    // Size M
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        size: 'M',
        price: 500000,
        description: 'Size vừa - 20 bông',
        stock: 50,
        isActive: true,
      },
    });

    // Size L
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        size: 'L',
        price: 800000,
        description: 'Size lớn - 30 bông',
        stock: 30,
        isActive: true,
      },
    });
  }

  // 7. Create Product-Flower Mappings
  console.log('🔗 Creating product-flower mappings...');
  await prisma.productFlowerMap.createMany({
    data: [
      // Product 1 - Hoa Hồng Đỏ
      { productId: product1.id, flowerId: hoaHongDo.id, quantity: 20 },
      { productId: product1.id, flowerId: hoaCamChuong.id, quantity: 5 },
      
      // Product 2 - Tulip
      { productId: product2.id, flowerId: hoaTulip.id, quantity: 15 },
      { productId: product2.id, flowerId: hoaHongTrang.id, quantity: 5 },
      
      // Product 3 - Lan
      { productId: product3.id, flowerId: hoaLan.id, quantity: 5 },
      
      // Product 4 - Hướng Dương
      { productId: product4.id, flowerId: hoaHuongDuong.id, quantity: 10 },
      { productId: product4.id, flowerId: hoaCamChuong.id, quantity: 5 },
    ],
    skipDuplicates: true,
  });

  // 8. Create Vouchers
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
      image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200',
      link: '/category/hoa-sinh-nhat',
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
      image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=1200',
      link: '/category/hoa-tinh-yeu',
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
      title: 'Hoa lan hồ điệp cao cấp',
      image: 'https://images.unsplash.com/photo-1533045971331-d9664dcdee86?w=1200',
      link: '/category/hoa-chuc-mung',
      description: 'Sang trọng và đẳng cấp',
      order: 3,
      isActive: true,
    },
  });

  // 10. Create Sample Orders
  console.log('📦 Creating sample orders...');
  const variant1 = await prisma.productVariant.findFirst({
    where: { productId: product1.id, size: 'M' },
  });

  const variant2 = await prisma.productVariant.findFirst({
    where: { productId: product2.id, size: 'S' },
  });

  if (variant1 && variant2) {
    const order1 = await prisma.order.create({
      data: {
        userId: user1.id,
        status: 'COMPLETED',
        total: 500000,
        note: 'Giao hàng cẩn thận',
        messageCard: 'Chúc em sinh nhật vui vẻ!',
        senderType: 'NAMED',
        receiver: {
          create: {
            name: 'Nguyễn Thị C',
            phone: '0934567890',
            address: '789 Lê Văn Sỹ, Quận 3, TP.HCM',
            deliveryDate: new Date('2025-12-05'),
            deliverySlot: '8-10h',
          },
        },
        items: {
          create: {
            variantId: variant1.id,
            quantity: 1,
            price: 500000,
            addons: JSON.stringify([]),
          },
        },
        payment: {
          create: {
            method: 'COD',
            amount: 500000,
            status: 'PAID',
          },
        },
      },
    });

    const order2 = await prisma.order.create({
      data: {
        userId: user2.id,
        status: 'DELIVERING',
        total: 300000,
        note: 'Giao giờ hành chính',
        messageCard: 'Chúc mừng sinh nhật bạn!',
        senderType: 'ANONYMOUS',
        receiver: {
          create: {
            name: 'Lê Văn D',
            phone: '0945678901',
            address: '321 Cách Mạng Tháng 8, Quận 10, TP.HCM',
            deliveryDate: new Date('2025-12-04'),
            deliverySlot: '14-16h',
          },
        },
        items: {
          create: {
            variantId: variant2.id,
            quantity: 1,
            price: 300000,
            addons: JSON.stringify([]),
          },
        },
        payment: {
          create: {
            method: 'BANK_TRANSFER',
            amount: 300000,
            status: 'PAID',
          },
        },
      },
    });

    // 11. Create Reviews for completed orders
    console.log('⭐ Creating reviews...');
    await prisma.review.create({
      data: {
        userId: user1.id,
        productId: product1.id,
        rating: 5,
        comment: 'Hoa rất đẹp và tươi! Giao hàng nhanh chóng. Sẽ ủng hộ shop tiếp!',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400',
        ]),
        isHidden: false,
        adminReply: {
          create: {
            content: 'Cảm ơn bạn đã tin tưởng và ủng hộ HoaShop! ❤️',
          },
        },
      },
    });

    await prisma.review.create({
      data: {
        userId: user2.id,
        productId: product2.id,
        rating: 4,
        comment: 'Tulip đẹp, ship hơi lâu 1 chút nhưng vẫn ok!',
        images: JSON.stringify([]),
        isHidden: false,
      },
    });

    // Create another review for product1
    await prisma.review.create({
      data: {
        userId: user2.id,
        productId: product1.id,
        rating: 5,
        comment: 'Hoa hồng đỏ rất tươi và thơm, đóng gói đẹp!',
        images: JSON.stringify([]),
        isHidden: false,
      },
    });
  }

  // 12. Create Wishlist
  console.log('❤️ Creating wishlists...');
  await prisma.wishlist.createMany({
    data: [
      { userId: user1.id, productId: product2.id },
      { userId: user1.id, productId: product3.id },
      { userId: user2.id, productId: product1.id },
      { userId: user2.id, productId: product4.id },
    ],
    skipDuplicates: true,
  });

  // 13. Create Stock Logs
  console.log('📝 Creating stock logs...');
  const stockHongDo = await prisma.flowerStock.findFirst({
    where: { flowerId: hoaHongDo.id },
  });

  if (stockHongDo) {
    await prisma.stockLog.createMany({
      data: [
        {
          stockId: stockHongDo.id,
          type: 'IMPORT',
          quantity: 500,
          note: 'Nhập hàng đầu tháng 12/2025',
        },
        {
          stockId: stockHongDo.id,
          type: 'EXPORT',
          quantity: 20,
          note: 'Xuất kho cho đơn hàng #001',
        },
      ],
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- Users: 3 (1 admin, 2 customers)');
  console.log('- Categories: 4');
  console.log('- Flowers: 6');
  console.log('- Products: 4 (with 3 variants each = 12 variants)');
  console.log('- Vouchers: 3');
  console.log('- Banners: 3');
  console.log('- Orders: 2 (1 completed, 1 delivering)');
  console.log('- Reviews: 3');
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
