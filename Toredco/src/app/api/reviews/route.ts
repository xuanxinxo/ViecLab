import { NextResponse } from 'next/server';

type ReviewSeed = {
  id: number;
  category: 'talent' | 'company';
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  avatar: string;
  dob?: string;
  experience?: number;
  hometown?: string;
};

export async function GET() {
  const data: ReviewSeed[] = [
    /* ─── Talent ⭐5 ─── */
    { id: 1, category: 'talent', name: 'Nguyễn Anh', rating: 5, avatar: '/img/atony.jpg', dob: '1997-04-12', experience: 5, hometown: 'Hà Nội' },
    { id: 2, category: 'talent', name: 'Trần Bình', rating: 5, avatar: '/img/congphuong.jpg', dob: '1995-08-30', experience: 6, hometown: 'Hải Phòng' },
    { id: 3, category: 'talent', name: 'Phạm Chi', rating: 5, avatar: '/img/traic.jpg', dob: '1999-02-18', experience: 3, hometown: 'Đà Nẵng' },
    { id: 4, category: 'talent', name: 'Hoàng Duy', rating: 5, avatar: '/img/ava.jpg', dob: '1996-07-11', experience: 7, hometown: 'Huế' },
    { id: 5, category: 'talent', name: 'Lê Gia', rating: 5, avatar: '/img/ava.jpg', dob: '1998-05-21', experience: 4, hometown: 'Quảng Nam' },
    { id: 6, category: 'talent', name: 'Đoàn Hậu', rating: 5, avatar: '/img/ava.jpg', dob: '1994-03-03', experience: 8, hometown: 'TP HCM' },
    { id: 7, category: 'talent', name: 'Vũ Khánh', rating: 5, avatar: '/img/ava.jpg', dob: '1993-10-29', experience: 9, hometown: 'Bình Dương' },

    /* ─── Talent ⭐4 ─── */
    { id: 8, category: 'talent', name: 'Lê Dũng', rating: 4, avatar: '/img/toni.jpg', dob: '1996-06-22', experience: 4, hometown: 'Huế' },
    { id: 9, category: 'talent', name: 'Đoàn Em', rating: 4, avatar: '/img/kaka.jpg', dob: '1998-11-10', experience: 4, hometown: 'Quảng Nam' },
    { id: 10, category: 'talent', name: 'Võ Giang', rating: 4, avatar: '/img/cr7.jpg', dob: '1994-03-03', experience: 7, hometown: 'TP HCM' },
    { id: 11, category: 'talent', name: 'Ngô Hải', rating: 4, avatar: '/img/ava.jpg', dob: '1997-01-14', experience: 5, hometown: 'Khánh Hòa' },
    { id: 12, category: 'talent', name: 'Trịnh Khang', rating: 4, avatar: '/img/ava.jpg', dob: '1995-09-12', experience: 6, hometown: 'Hải Dương' },
    { id: 13, category: 'talent', name: 'Đinh Long', rating: 4, avatar: '/img/ava.jpg', dob: '1993-04-25', experience: 8, hometown: 'Thanh Hóa' },
    { id: 14, category: 'talent', name: 'Nguyễn Mai', rating: 4, avatar: '/img/ava.jpg', dob: '1999-03-16', experience: 3, hometown: 'Quảng Bình' },

    /* ─── Talent ⭐3 ─── */
    { id: 15, category: 'talent', name: 'Hồ Hạnh', rating: 3, avatar: '/img/traid.jpg', dob: '2000-09-15', experience: 2, hometown: 'Cần Thơ' },
    { id: 16, category: 'talent', name: 'Mai Khoa', rating: 3, avatar: '/img/traie.jpg', dob: '1997-12-01', experience: 3, hometown: 'Bình Định' },
    { id: 17, category: 'talent', name: 'Bùi Lâm', rating: 3, avatar: '/img/traih.jpg', dob: '1993-05-27', experience: 8, hometown: 'Nghệ An' },
    { id: 18, category: 'talent', name: 'Phan Nam', rating: 3, avatar: '/img/ava.jpg', dob: '1996-10-05', experience: 5, hometown: 'Kon Tum' },
    { id: 19, category: 'talent', name: 'Tạ Oanh', rating: 3, avatar: '/img/ava.jpg', dob: '1995-02-11', experience: 6, hometown: 'Bắc Giang' },
    { id: 20, category: 'talent', name: 'Vũ Phúc', rating: 3, avatar: '/img/ava.jpg', dob: '1998-07-19', experience: 4, hometown: 'Thái Nguyên' },
    { id: 21, category: 'talent', name: 'Đoàn Quân', rating: 3, avatar: '/img/ava.jpg', dob: '1992-11-29', experience: 10, hometown: 'Hải Phòng' },

    /* ─── Talent ⭐2 ─── */
    { id: 22, category: 'talent', name: 'Ngô Thắng', rating: 2, avatar: '/img/traih.jpg', dob: '1998-10-05', experience: 2, hometown: 'Phú Thọ' },
    { id: 23, category: 'talent', name: 'Đặng Yến', rating: 2, avatar: '/img/traip.jpg', dob: '1997-11-22', experience: 3, hometown: 'Quảng Trị' },
    { id: 24, category: 'talent', name: 'Đào Kiên', rating: 2, avatar: '/img/vana.jpg', dob: '1994-01-17', experience: 4, hometown: 'Hòa Bình' },
    { id: 25, category: 'talent', name: 'Trần Quốc', rating: 2, avatar: '/img/ava.jpg', dob: '1999-08-30', experience: 2, hometown: 'Hà Nam' },
    { id: 26, category: 'talent', name: 'Phạm Sơn', rating: 2, avatar: '/img/ava.jpg', dob: '1996-05-14', experience: 5, hometown: 'Đồng Nai' },
    { id: 27, category: 'talent', name: 'Nguyễn Thư', rating: 2, avatar: '/img/ava.jpg', dob: '1998-03-27', experience: 3, hometown: 'Ninh Bình' },
    { id: 28, category: 'talent', name: 'Lâm Vũ', rating: 2, avatar: '/img/ava.jpg', dob: '1993-12-08', experience: 7, hometown: 'Bắc Ninh' },

    /* ─── Talent ⭐1 ─── */
    { id: 29, category: 'talent', name: 'Lữ Hiếu', rating: 1, avatar: '/img/ava.jpg', dob: '1996-03-09', experience: 2, hometown: 'Thái Bình' },
    { id: 30, category: 'talent', name: 'Đinh Phú', rating: 1, avatar: '/img/ava.jpg', dob: '1995-06-02', experience: 3, hometown: 'Gia Lai' },
    { id: 31, category: 'talent', name: 'Trữ Quân', rating: 1, avatar: '/img/ava.jpg', dob: '1992-12-12', experience: 5, hometown: 'Sóc Trăng' },
    { id: 32, category: 'talent', name: 'Hoàng Sang', rating: 1, avatar: '/img/ava.jpg', dob: '1999-11-23', experience: 1, hometown: 'Đắk Lắk' },
    { id: 33, category: 'talent', name: 'Phan Tùng', rating: 1, avatar: '/img/ava.jpg', dob: '1997-04-18', experience: 2, hometown: 'Quảng Ngãi' },
    { id: 34, category: 'talent', name: 'Nguyễn Uyên', rating: 1, avatar: '/img/ava.jpg', dob: '1994-09-10', experience: 3, hometown: 'Vĩnh Long' },
    { id: 35, category: 'talent', name: 'Đỗ Văn', rating: 1, avatar: '/img/ava.jpg', dob: '1993-01-25', experience: 6, hometown: 'Nam Định' },

    /* ─── Company F&B ⭐5 ─── */
    { id: 201, category: 'company', name: 'Highlands Coffee', rating: 5, avatar: '/img/hl.png' },
    { id: 202, category: 'company', name: 'Lotteria Vietnam', rating: 5, avatar: '/img/lot.png' },
    { id: 203, category: 'company', name: 'The Coffee House', rating: 5, avatar: '/img/house.jpg' },
    { id: 204, category: 'company', name: 'Phúc Long Coffee & Tea', rating: 5, avatar: '/img/phuclong.png' },
    { id: 205, category: 'company', name: 'KFC Vietnam', rating: 5, avatar: '/img/kfc.png' },
    { id: 206, category: 'company', name: 'Pizza 4P’s', rating: 5, avatar: '/img/pizza4ps.png' },
    { id: 207, category: 'company', name: 'Gong Cha Vietnam', rating: 5, avatar: '/img/gongcha.png' },

    /* ─── Company F&B ⭐4 ─── */
    { id: 208, category: 'company', name: 'Texas Chicken Vietnam', rating: 4, avatar: '/img/gaf.jpg' },
    { id: 209, category: 'company', name: 'Jollibee Vietnam', rating: 4, avatar: '/img/joli.png' },
    { id: 210, category: 'company', name: 'Domino’s Pizza Vietnam', rating: 4, avatar: '/img/domi.png' },
    { id: 211, category: 'company', name: 'Tous Les Jours', rating: 4, avatar: '/img/touslesjours.png' },
    { id: 212, category: 'company', name: 'Starbucks Vietnam', rating: 4, avatar: '/img/starbucks.png' },
    { id: 213, category: 'company', name: 'Baskin Robbins Vietnam', rating: 4, avatar: '/img/baskinrobbins.png' },
    { id: 214, category: 'company', name: 'The Pizza Company', rating: 4, avatar: '/img/thepizzacompany.png' },

    /* ─── Company F&B ⭐3 ─── */
    { id: 215, category: 'company', name: 'Burger King Vietnam', rating: 3, avatar: '/img/bagoer.png' },
    { id: 216, category: 'company', name: 'Cộng Cà Phê', rating: 3, avatar: '/img/cong.png' },
    { id: 217, category: 'company', name: 'Urban Station Coffee', rating: 3, avatar: '/img/bun.png' },
    { id: 218, category: 'company', name: 'Chuk Tea & Coffee', rating: 3, avatar: '/img/chuk.png' },
    { id: 219, category: 'company', name: 'King BBQ', rating: 3, avatar: '/img/kingbbq.png' },
    { id: 220, category: 'company', name: 'Haidilao Vietnam', rating: 3, avatar: '/img/haidilao.png' },
    { id: 221, category: 'company', name: 'Sushi Kei', rating: 3, avatar: '/img/sushikei.png' },

    /* ─── Company F&B ⭐2 ─── */
    { id: 222, category: 'company', name: 'Gogi House', rating: 2, avatar: '/img/gogi.png' },
    { id: 223, category: 'company', name: 'Sushi Bar Vietnam', rating: 2, avatar: '/img/sushi.jpg' },
    { id: 224, category: 'company', name: 'Bún Đậu Mắm Tôm 1979', rating: 2, avatar: '/img/bun.jpg' },
    { id: 225, category: 'company', name: 'Lẩu Wang', rating: 2, avatar: '/img/lauwang.png' },
    { id: 226, category: 'company', name: 'Xiên Que Vietnam', rating: 2, avatar: '/img/xienque.png' },
    { id: 227, category: 'company', name: 'Hotpot Story', rating: 2, avatar: '/img/hotpotstory.png' },
    { id: 228, category: 'company', name: 'Trà Sữa Bobapop', rating: 2, avatar: '/img/bobapop.png' },

    /* ─── Company F&B ⭐1 ─── */
    { id: 229, category: 'company', name: 'Trà Sữa Tocotoco', rating: 1, avatar: '/img/tocco.png' },
    { id: 230, category: 'company', name: 'Feeling Tea', rating: 1, avatar: '/img/fee.png' },
    { id: 231, category: 'company', name: 'Sharetea Vietnam', rating: 1, avatar: '/img/share.jpg' },
    { id: 232, category: 'company', name: 'Royaltea Vietnam', rating: 1, avatar: '/img/royaltea.png' },
    { id: 233, category: 'company', name: 'Trà Sữa Ding Tea', rating: 1, avatar: '/img/dingtea.png' },
    { id: 234, category: 'company', name: 'Ten Ren Tea Vietnam', rating: 1, avatar: '/img/tenren.png' },
    { id: 235, category: 'company', name: 'Trà Sữa Heekcaa', rating: 1, avatar: '/img/heekcaa.png' },

  ];

  return NextResponse.json({ data });
}
