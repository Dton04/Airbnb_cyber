-- CreateTable
CREATE TABLE "BinhLuan" (
    "id" SERIAL NOT NULL,
    "ma_phong" INTEGER,
    "ma_nguoi_binh_luan" INTEGER,
    "ngay_binh_luan" TIMESTAMP(6),
    "noi_dung" TEXT,
    "sao_binh_luan" INTEGER,
    "deletedBy" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BinhLuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatPhong" (
    "id" SERIAL NOT NULL,
    "ma_phong" INTEGER,
    "ngay_den" TIMESTAMP(6),
    "ngay_di" TIMESTAMP(6),
    "so_luong_khach" INTEGER,
    "ma_nguoi_dat" INTEGER,
    "deletedBy" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatPhong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NguoiDung" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "email" VARCHAR(255),
    "pass_word" VARCHAR(255),
    "phone" VARCHAR(20),
    "birth_day" VARCHAR(50),
    "gender" VARCHAR(20),
    "role" VARCHAR(50),
    "avatar" VARCHAR(255),
    "deletedBy" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NguoiDung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phong" (
    "id" SERIAL NOT NULL,
    "ten_phong" VARCHAR(255),
    "khach" INTEGER,
    "phong_ngu" INTEGER,
    "giuong" INTEGER,
    "phong_tam" INTEGER,
    "mo_ta" TEXT,
    "gia_tien" INTEGER,
    "may_giat" BOOLEAN,
    "ban_la" BOOLEAN,
    "tivi" BOOLEAN,
    "dieu_hoa" BOOLEAN,
    "wifi" BOOLEAN,
    "bep" BOOLEAN,
    "do_xe" BOOLEAN,
    "ho_boi" BOOLEAN,
    "ban_ui" BOOLEAN,
    "hinh_anh" VARCHAR(255),
    "ma_vi_tri" INTEGER,
    "deletedBy" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Phong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViTri" (
    "id" SERIAL NOT NULL,
    "ten_vi_tri" VARCHAR(255),
    "tinh_thanh" VARCHAR(255),
    "quoc_gia" VARCHAR(255),
    "hinh_anh" VARCHAR(255),
    "deletedBy" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViTri_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BinhLuan_ma_nguoi_binh_luan_idx" ON "BinhLuan"("ma_nguoi_binh_luan");

-- CreateIndex
CREATE INDEX "BinhLuan_ma_phong_idx" ON "BinhLuan"("ma_phong");

-- CreateIndex
CREATE INDEX "DatPhong_ma_nguoi_dat_idx" ON "DatPhong"("ma_nguoi_dat");

-- CreateIndex
CREATE INDEX "DatPhong_ma_phong_idx" ON "DatPhong"("ma_phong");

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_email_key" ON "NguoiDung"("email");

-- CreateIndex
CREATE INDEX "Phong_ma_vi_tri_idx" ON "Phong"("ma_vi_tri");

-- CreateIndex
CREATE INDEX "Phong_ten_phong_idx" ON "Phong"("ten_phong");

-- CreateIndex
CREATE INDEX "ViTri_ten_vi_tri_idx" ON "ViTri"("ten_vi_tri");

-- AddForeignKey
ALTER TABLE "BinhLuan" ADD CONSTRAINT "BinhLuan_ma_nguoi_binh_luan_fkey" FOREIGN KEY ("ma_nguoi_binh_luan") REFERENCES "NguoiDung"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BinhLuan" ADD CONSTRAINT "BinhLuan_ma_phong_fkey" FOREIGN KEY ("ma_phong") REFERENCES "Phong"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DatPhong" ADD CONSTRAINT "DatPhong_ma_nguoi_dat_fkey" FOREIGN KEY ("ma_nguoi_dat") REFERENCES "NguoiDung"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DatPhong" ADD CONSTRAINT "DatPhong_ma_phong_fkey" FOREIGN KEY ("ma_phong") REFERENCES "Phong"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Phong" ADD CONSTRAINT "Phong_ma_vi_tri_fkey" FOREIGN KEY ("ma_vi_tri") REFERENCES "ViTri"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
