DELETE FROM products;

INSERT INTO products (name, name_zh, description, description_zh, price, stock, category, image_url, metadata)
VALUES (
  'The Royal Paws',
  '皇家爪印',
  'A majestic oil painting that transforms your pet into a 17th-century aristocrat. Every brushstroke captures the noble spirit of your furry companion, rendered in a timeless Renaissance style.',
  '一幅庄严的油画，将您的宠物化身为17世纪的贵族。每一笔触都捕捉到了您毛茸茸伙伴的高贵灵魂，以永恒的文艺复兴风格呈现。',
  149,
  50,
  'Oil Painting',
  'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?q=80&w=1000&auto=format&fit=crop',
  '{"style": "Classic Oil Painting", "mood": "Majestic", "era": "Renaissance"}'::jsonb
);

INSERT INTO products (name, name_zh, description, description_zh, price, stock, category, image_url, metadata)
VALUES (
  'Neon Whisker 2077',
  '霓虹胡须 2077',
  'Dive into the future with this cyberpunk-inspired digital masterpiece. Vibrant neon lights and futuristic aesthetics meet the timeless charm of your pet in a high-energy urban setting.',
  '沉浸在这部受赛博朋克启发的数字杰作中。鲜艳的霓虹灯和未来主义美学在充满活力的城市背景下，与您宠物的永恒魅力相遇。',
  89,
  100,
  'Digital Art',
  'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=1000&auto=format&fit=crop',
  '{"style": "Cyberpunk", "mood": "Energetic", "theme": "Futuristic"}'::jsonb
);

INSERT INTO products (name, name_zh, description, description_zh, price, stock, category, image_url, metadata)
VALUES (
  'Pixar-Perfect Portrait',
  '皮克斯萌宠肖像',
  'Bring the magic of 3D animation to your home. This style captures the expressive eyes and playful personality of your pet in a heartwarming 3D render that feels straight out of a movie.',
  '将3D动画的魔力带入您的家中。这种风格以温馨的3D渲染捕捉您宠物传神的眼睛和顽皮的个性，仿佛直接从电影银幕中走出来一般。',
  129,
  75,
  'Digital Art',
  'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=1000&auto=format&fit=crop',
  '{"style": "3D Pixar", "mood": "Playful", "type": "3D Render"}'::jsonb
);

INSERT INTO products (name, name_zh, description, description_zh, price, stock, category, image_url, metadata)
VALUES (
  'Pop Art Paws',
  '波普爪爪',
  'Bold, colorful, and iconic. Inspired by Andy Warhol, this piece turns your pet into a modern art legend with vibrant color blocks and high-contrast visual impact.',
  '大胆、多彩且具有标志性。受安迪·沃霍尔的启发，这件作品用鲜艳的色块和高对比度的视觉冲击力，将您的宠物变成现代艺术传奇。',
  79,
  120,
  'Digital Art',
  'https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=1000&auto=format&fit=crop',
  '{"style": "Pop Art", "mood": "Vibrant", "artist_influence": "Andy Warhol"}'::jsonb
);

INSERT INTO products (name, name_zh, description, description_zh, price, stock, category, image_url, metadata)
VALUES (
  'Ethereal Flow',
  '缥缈流影',
  'A delicate watercolor painting that blends soft hues and fluid lines. Perfect for capturing the gentle and soulful nature of your beloved pet in a serene, artistic wash.',
  '一幅精致的水彩画，融合了柔和的色调和流畅的线条。完美捕捉您心爱宠物温柔而深情的本性，呈现出宁静而富有艺术感的洗练效果。',
  69,
  80,
  'Watercolor',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop',
  '{"style": "Watercolor", "mood": "Serene", "technique": "Fluid"}'::jsonb
);

INSERT INTO products (name, name_zh, description, description_zh, price, stock, category, image_url, metadata)
VALUES (
  'The Renaissance Feline',
  '文艺复兴之猫',
  'A sophisticated oil portrait that highlights the mysterious and elegant aura of cats. A timeless piece that brings a touch of classical grace to any art-loving home.',
  '一幅精致的油画肖像，突出了猫咪神秘而优雅的气息。这是一件永恒的作品，为任何热爱艺术的家庭增添一份古典的优雅。',
  139,
  45,
  'Oil Painting',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop',
  '{"style": "Classic Oil Painting", "mood": "Elegant", "subject": "Cat"}'::jsonb
);

INSERT INTO products (name, name_zh, description, description_zh, price, stock, category, image_url, metadata)
VALUES (
  'Cyber-K9 Unit',
  '赛博 K9 小队',
  'Gear up your dog for the digital age. This cyberpunk style features high-tech overlays and a gritty, urban atmosphere for the modern, tech-savvy pet owner.',
  '为您的狗狗准备好迎接数字时代。这种赛博朋克风格具有高科技叠加层和坚韧的城市氛围，专为现代、精通科技的宠物主打造。',
  99,
  90,
  'Digital Art',
  'https://images.unsplash.com/photo-1573865668131-9741707203e3?q=80&w=1000&auto=format&fit=crop',
  '{"style": "Cyberpunk", "mood": "Gritty", "theme": "Urban"}'::jsonb
);

INSERT INTO products (name, name_zh, description, description_zh, price, stock, category, image_url, metadata)
VALUES (
  'Pastel Dreams',
  '柔彩之梦',
  'Soft pastel watercolor strokes create a dreamlike atmosphere. A gentle tribute to the quiet, intimate moments shared with your pet in a soft, ethereal palette.',
  '柔和的粉彩水彩笔触营造出梦幻般的氛围。以柔和、空灵的色调，向与宠物分享的宁静、亲密时光致以温柔的敬意。',
  59,
  110,
  'Watercolor',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=1000&auto=format&fit=crop',
  '{"style": "Watercolor", "mood": "Dreamy", "palette": "Pastel"}'::jsonb
);
