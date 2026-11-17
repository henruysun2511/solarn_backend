import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const blogs = [
  {
    title: 'Bí quyết luyện thi IELTS Speaking đạt 7.0+',
    slug: 'bi-quyet-luyen-thi-ielts-speaking-dat-70',
    thumbnail: 'https://i.pinimg.com/1200x/46/3d/d9/463dd91339bea8859afd002d6a0a9f83.jpg',
    excerpt:
      'Khám phá chiến lược ôn luyện IELTS Speaking hiệu quả từ chuyên gia, giúp bạn tự tin chinh phục band điểm 7.0+ chỉ trong 3 tháng.',
    content: `<h2>IELTS Speaking không còn là nỗi sợ</h2>
<p>IELTS Speaking là một trong bốn kỹ năng khiến nhiều thí sinh lo lắng nhất bởi tính tương tác trực tiếp với giám khảo. Tuy nhiên, với lộ trình đúng đắn và phương pháp phù hợp, bạn hoàn toàn có thể đạt band điểm 7.0+.</p>

<h3>1. Hiểu rõ tiêu chí chấm điểm</h3>
<p>Giám khảo IELTS chấm điểm dựa trên 4 tiêu chí: Fluency and Coherence (Độ trôi chảy và mạch lạc), Lexical Resource (Vốn từ vựng), Grammatical Range and Accuracy (Độ đa dạng và chính xác ngữ pháp), và Pronunciation (Phát âm). Mỗi tiêu chí chiếm 25% tổng điểm.</p>
<p>Để đạt 7.0+, bạn cần:</p>
<ul>
<li>Nói trôi chảy, ít ngập ngừng, có kết nối ý tưởng logic</li>
<li>Sử dụng linh hoạt các cấu trúc ngữ pháp phức tạp</li>
<li>Phát âm rõ ràng, đúng trọng âm và ngữ điệu</li>
<li>Sử dụng thành ngữ và collocations tự nhiên</li>
</ul>

<h3>2. Chiến lược ôn luyện theo từng phần</h3>
<h4>Part 1 — Giới thiệu (4-5 phút)</h4>
<p>Trả lời ngắn gọn, trực tiếp vào câu hỏi. Mỗi câu trả lời nên kéo dài 15-20 giây, bao gồm câu trả lời chính + 1-2 câu giải thích hoặc ví dụ.</p>

<h4>Part 2 — Chủ đề dài (3-4 phút)</h4>
<p>Bạn có 1 phút chuẩn bị và 2 phút nói. Hãy tận dụng thời gian chuẩn bị để ghi chú nhanh các ý chính. Cấu trúc bài nói gồm: mở đầu, nội dung chính (2-3 ý), kết luận hoặc cảm nhận cá nhân.</p>

<h4>Part 3 — Thảo luận (4-5 phút)</h4>
<p>Đây là phần khó nhất, yêu cầu bạn phân tích, so sánh và đưa ra quan điểm cá nhân về các vấn đề xã hội. Hãy sử dụng cấu trúc: Opinion → Reason → Example → Conclusion.</p>

<h3>3. Luyện tập với công nghệ</h3>
<p>Tại SOLARN, chúng tôi sử dụng hệ thống LMS thông minh giúp bạn ghi âm và phân tích bài nói, nhận phản hồi chi tiết từ giảng viên về từng tiêu chí chấm điểm. Bạn cũng có thể tham gia các buổi Speaking Club hàng tuần để thực hành với bạn bè.</p>

<blockquote>"Sau 3 tháng luyện tập tại SOLARN, em đã tăng từ 5.5 lên 7.5 IELTS Speaking. Phương pháp sửa lỗi phát âm chi tiết của các thầy cô đã thay đổi hoàn toàn cách em nói tiếng Anh." — Nguyễn Minh Anh, học viên IELTS Intensive</blockquote>

<h3>4. Tài nguyên hữu ích</h3>
<p>Đừng quên tận dụng các nguồn tài liệu sau: bộ đề dự đoán IELTS Speaking hàng quý, ứng dụng ghi âm và phân tích giọng nói, và các video mẫu bài nói đạt điểm cao từ thí sinh trên toàn thế giới.</p>

<p>Hãy bắt đầu hành trình chinh phục IELTS Speaking ngay hôm nay cùng SOLARN!</p>`,
    author: 'Ms. Thúy Hoài'
  },
  {
    title: 'Phương pháp học từ vựng tiếng Anh hiệu quả với công nghệ',
    slug: 'phuong-phap-hoc-tu-vung-tieng-anh-hieu-qua-voi-cong-nghe',
    thumbnail: 'https://i.pinimg.com/1200x/1f/da/03/1fda03056c75316ef1b01283cb382388.jpg',
    excerpt:
      'Ứng dụng công nghệ vào việc học từ vựng giúp bạn ghi nhớ nhanh hơn, lâu hơn và áp dụng linh hoạt trong giao tiếp thực tế.',
    content: `<h2>Học từ vựng thời 4.0</h2>
<p>Ghi nhớ hàng nghìn từ vựng tiếng Anh chưa bao giờ là dễ dàng. Nhưng với sự hỗ trợ của công nghệ, quá trình này trở nên thú vị và hiệu quả hơn rất nhiều. Bài viết này sẽ giới thiệu những phương pháp học từ vựng hiện đại đang được áp dụng thành công tại SOLARN.</p>

<h3>1. Phương pháp Spaced Repetition (Lặp lại ngắt quãng)</h3>
<p>Đây là kỹ thuật ghi nhớ dựa trên nghiên cứu khoa học về trí nhớ con người. Thay vì học dồn một lúc, bạn ôn tập từ vựng vào những khoảng thời gian tối ưu: sau 1 giờ, 1 ngày, 1 tuần, 1 tháng. Hệ thống LMS của SOLARN tự động nhắc nhở và sắp xếp lịch ôn tập dựa trên tiến độ của từng học viên.</p>

<h3>2. Học từ vựng qua ngữ cảnh</h3>
<p>Đừng học từ đơn lẻ! Hãy đặt chúng vào câu, đoạn hội thoại hoặc câu chuyện. Nghiên cứu cho thấy việc học từ vựng trong ngữ cảnh giúp tăng khả năng ghi nhớ lên đến 80% so với học từ riêng lẻ. Tại SOLARN, mỗi bài học đều được thiết kế với các tình huống thực tế, giúp bạn hiểu sâu và nhớ lâu.</p>

<h3>3. Sử dụng sơ đồ tư duy (Mind Map)</h3>
<p>Nhóm các từ vựng theo chủ đề sẽ giúp bộ não của bạn tạo ra các liên kết mạnh mẽ. Ví dụ, với chủ đề "Environment", bạn có thể nhóm các từ liên quan đến: pollution (ô nhiễm), conservation (bảo tồn), renewable energy (năng lượng tái tạo), climate change (biến đổi khí hậu).</p>

<h3>4. Flashcard thông minh</h3>
<p>Thay vì flashcard giấy truyền thống, hãy sử dụng các ứng dụng flashcard kỹ thuật số có tích hợp hình ảnh, âm thanh và ví dụ. Hệ thống của SOLARN cung cấp kho flashcard điện tử với hơn 5,000 từ vựng theo từng cấp độ, kèm phát âm chuẩn và câu ví dụ minh họa.</p>

<h3>5. Kiểm tra và đánh giá</h3>
<p>Việc thường xuyên kiểm tra từ vựng giúp củng cố trí nhớ dài hạn. Hệ thống bài tập thích ứng của SOLARN sẽ tự động điều chỉnh độ khó dựa trên kết quả của bạn, tập trung vào những từ bạn còn yếu để tối ưu thời gian học.</p>

<blockquote>"Em đã từng rất sợ học từ vựng vì học trước quên sau. Từ khi áp dụng phương pháp Spaced Repetition trên LMS của SOLARN, em nhớ được 50 từ mới mỗi tuần và có thể sử dụng chúng trong giao tiếp hàng ngày." — Trần Hoàng Long, học viên Communication Plus</blockquote>

<p>Đừng để vốn từ vựng hạn chế là rào cản trên con đường chinh phục tiếng Anh của bạn. Hãy đăng ký ngay hôm nay để trải nghiệm phương pháp học hiện đại tại SOLARN!</p>`,
    author: 'Mr. James Nguyen'
  },
  {
    title: 'Lộ trình học tiếng Anh cho người mất gốc',
    slug: 'lo-trinh-hoc-tieng-anh-cho-nguoi-mat-goc',
    thumbnail: 'https://i.pinimg.com/1200x/cb/0e/89/cb0e8909900d125fd646a200692102d7.jpg',
    excerpt:
      'Bạn đã mất gốc tiếng Anh nhiều năm? Đừng lo, lộ trình 6 tháng tại SOLARN sẽ giúp bạn xây dựng lại nền tảng vững chắc từ con số 0.',
    content: `<h2>Mất gốc tiếng Anh — Không có gì phải xấu hổ</h2>
<p>Rất nhiều người Việt Nam đã học tiếng Anh nhiều năm nhưng vẫn không thể giao tiếp cơ bản. Nguyên nhân chính là do phương pháp học sai, thiếu định hướng và không có môi trường thực hành. Tin vui là: mất gốc hoàn toàn có thể khắc phục được với lộ trình đúng đắn.</p>

<h3>Giai đoạn 1: Xây dựng nền tảng (Tháng 1-2)</h3>
<h4>Phát âm — Nền tảng quan trọng nhất</h4>
<p>Bắt đầu với bảng phiên âm IPA (International Phonetic Alphabet). Học cách phát âm đúng 44 âm trong tiếng Anh, đặc biệt là các âm không có trong tiếng Việt như /θ/, /ð/, /ʃ/, /ʒ/. Dành 2 tuần đầu chỉ để luyện phát âm.</p>

<h4>Từ vựng cơ bản</h4>
<p>Học 300 từ vựng thông dụng nhất theo chủ đề: gia đình, công việc, sở thích, mua sắm, du lịch. Mỗi ngày 10 từ, kết hợp với hình ảnh và âm thanh.</p>

<h4>Ngữ pháp nền</h4>
<p>Tập trung vào các thì cơ bản: Hiện tại đơn, Hiện tại tiếp diễn, Quá khứ đơn, Tương lai đơn. Học cách đặt câu hỏi và câu phủ định.</p>

<h3>Giai đoạn 2: Phát triển kỹ năng (Tháng 3-4)</h3>
<h4>Nghe — Bắt đầu từ những gì đơn giản nhất</h4>
<p>Nghe các đoạn hội thoại ngắn (1-2 phút) với tốc độ chậm. ESL Lab, BBC Learning English, và Voice of America là những nguồn tài liệu tuyệt vời. Nghe đi nghe lại nhiều lần, kết hợp với phụ đề.</p>

<h4>Nói — Tự tin lên tiếng</h4>
<p>Tập nói trước gương, ghi âm và nghe lại để tự sửa lỗi. Tham gia các câu lạc bộ tiếng Anh để thực hành với người thật. Tại SOLARN, chúng tôi tổ chức các buổi Speaking Club hàng tuần với giáo viên bản ngữ.</p>

<h3>Giai đoạn 3: Hoàn thiện và nâng cao (Tháng 5-6)</h3>
<h4>Đọc — Mở rộng kiến thức</h4>
<p>Đọc các bài báo đơn giản từ BBC News, CNN Student News. Học cách đọc nhanh, nắm ý chính và đoán nghĩa từ ngữ cảnh.</p>

<h4>Viết — Từ câu đơn đến đoạn văn</h4>
<p>Bắt đầu bằng viết nhật ký hàng ngày bằng tiếng Anh (3-5 câu/ngày). Sau đó phát triển lên viết đoạn văn 100-150 từ về các chủ đề quen thuộc.</p>

<h3>Học tại SOLARN — Lộ trình cá nhân hóa</h3>
<p>Điểm mạnh của SOLARN là chương trình được thiết kế riêng cho từng học viên. Sau bài kiểm tra đầu vào, bạn sẽ được xếp lớp phù hợp và có lộ trình học được cá nhân hóa dựa trên điểm mạnh, điểm yếu của bản thân. Hệ thống LMS theo dõi tiến độ từng ngày và điều chỉnh phương pháp giảng dạy linh hoạt.</p>

<blockquote>"Em mất gốc tiếng Anh từ năm cấp 2. Lên đại học, em quyết tâm học lại từ đầu tại SOLARN. Sau 6 tháng, em đã tự tin giao tiếp cơ bản và đạt 5.5 IELTS. Cảm ơn các thầy cô đã kiên nhẫn đồng hành cùng em!" — Lê Thị Phương, học viên Pre-IELTS Foundation</blockquote>

<p>Đừng chần chừ thêm nữa! Hành trình vạn dặm bắt đầu từ một bước chân. Hãy đến SOLARN để xây dựng lại nền tảng tiếng Anh vững chắc ngay hôm nay.</p>`,
    author: 'Ms. Sarah Lan'
  },
  {
    title: 'Tại sao nên chọn khóa học tiếng Anh tại SOLARN?',
    slug: 'tai-sao-nen-chon-khoa-hoc-tieng-anh-tai-solarn',
    thumbnail: 'https://i.pinimg.com/1200x/3f/da/1e/3fda1e652ec1973f4271348e26e03627.jpg',
    excerpt:
      'SOLARN không chỉ là trung tâm tiếng Anh — chúng tôi mang đến một hệ sinh thái học tập toàn diện với công nghệ hiện đại và đội ngũ giảng viên xuất sắc.',
    content: `<h2>Hơn cả một trung tâm tiếng Anh</h2>
<p>Với hơn 10,000 học viên đã tin tưởng và theo học, SOLARN tự hào là một trong những trung tâm đào tạo tiếng Anh hàng đầu tại Việt Nam. Vậy điều gì làm nên sự khác biệt của SOLARN?</p>

<h3>1. Hệ thống LMS thông minh</h3>
<p>SOLARN sở hữu nền tảng học tập trực tuyến (LMS) hiện đại, cho phép học viên theo dõi tiến độ học tập theo thời gian thực. Bạn có thể xem điểm danh, điểm số bài tập, tiến độ khóa học và lịch học mọi lúc mọi nơi. Hệ thống còn tự động phân tích điểm mạnh, điểm yếu và đề xuất bài tập phù hợp.</p>

<h3>2. Đội ngũ giảng viên xuất sắc</h3>
<p>100% giảng viên tại SOLARN có chứng chỉ giảng dạy quốc tế (TESOL, CELTA) và điểm IELTS 8.0+. Không chỉ giỏi chuyên môn, các thầy cô còn là những người truyền cảm hứng, luôn đồng hành cùng học viên trên mọi chặng đường.</p>

<h3>3. Lộ trình học cá nhân hóa</h3>
<p>Không có hai học viên nào có lộ trình giống nhau tại SOLARN. Sau bài kiểm tra đầu vào toàn diện, hệ thống sẽ thiết kế chương trình học riêng biệt dựa trên trình độ, mục tiêu, thời gian biểu và phong cách học tập của từng người.</p>

<h3>4. Phương pháp giảng dạy hiện đại</h3>
<p>Chúng tôi kết hợp giữa giảng dạy trực tiếp trên lớp và học tập trực tuyến qua LMS, áp dụng phương pháp "Blended Learning" giúp tối ưu hóa thời gian và hiệu quả học tập. Mỗi buổi học đều có sự tương tác cao giữa giảng viên và học viên.</p>

<h3>5. Dịch vụ hỗ trợ toàn diện</h3>
<p>Từ việc tư vấn lộ trình, hỗ trợ hành chính đến quản lý học phí trực tuyến qua PayOS — mọi quy trình đều được số hóa và tự động hóa. Bạn có thể gửi yêu cầu bảo lưu, chuyển lớp, tái nhập học trực tiếp trên hệ thống mà không cần đến trung tâm.</p>

<h3>6. Môi trường học tập chuẩn quốc tế</h3>
<p>Các phòng học tại SOLARN được thiết kế theo tiêu chuẩn 5 sao với trang thiết bị hiện đại, không gian mở và ánh sáng tối ưu. Mỗi phòng học đều được trang bị bảng tương tác thông minh và hệ thống âm thanh chất lượng cao.</p>

<h3>7. Kết quả đầu ra cam kết</h3>
<p>Chúng tôi cam kết đầu ra bằng văn bản cho từng khóa học. Học viên không đạt mục tiêu sẽ được học lại miễn phí. Tỷ lệ học viên đạt mục tiêu đầu ra tại SOLARN lên đến 95%, với nhiều học viên đạt IELTS 7.5+ sau 6 tháng.</p>

<blockquote>"Mình đã tìm hiểu rất nhiều trung tâm trước khi quyết định chọn SOLARN. Điểm khác biệt lớn nhất là công nghệ — LMS của SOLARN giúp mình theo dõi tiến độ từng ngày, biết rõ mình cần cải thiện kỹ năng nào. Kết quả là sau 4 tháng, mình đã tăng từ 5.0 lên 7.0 IELTS." — Phạm Quốc Bảo, học viên IELTS Intensive</blockquote>

<p>Còn chần chừ gì nữa? Hãy đăng ký ngay hôm nay để trải nghiệm sự khác biệt tại SOLARN!</p>`,
    author: 'Ms. Thúy Hoài'
  }
];

async function main() {
  console.log('🌱 Bắt đầu tạo bài viết blog...\n');

  for (const blog of blogs) {
    const existing = await prisma.blog.findUnique({ where: { slug: blog.slug } });
    if (existing) {
      console.log(`⏭  Bài viết "${blog.title}" đã tồn tại, bỏ qua.`);
      continue;
    }

    await prisma.blog.create({
      data: {
        ...blog,
        isPublished: true,
        publishedAt: new Date()
      }
    });
    console.log(`✅ Đã tạo: "${blog.title}"`);
  }

  console.log('\n🎉 Hoàn thành!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
