export interface ExamMCQ {
  question: string
  options: string[]
  answer: number
  explanation?: string
}

export interface ExamEssay {
  question: string
  guide: string
  points: number
}

export interface ExamBank {
  mcq: ExamMCQ[]
  essay: ExamEssay[]
}

export const EXAM_BANK: Record<string, ExamBank> = {
  CN305: {
    mcq: [
      { question: 'Trong mô hình quan hệ, khóa chính (primary key) có đặc điểm nào sau đây?', options: ['Cho phép giá trị NULL', 'Xác định duy nhất mỗi bộ trong quan hệ', 'Luôn là thuộc tính kiểu số', 'Chỉ dùng cho bảng có một cột'], answer: 1, explanation: 'Khóa chính phải duy nhất và không NULL để định danh từng bộ.' },
      { question: 'Câu lệnh SQL nào dùng để loại bỏ các dòng trùng lặp trong kết quả truy vấn?', options: ['SELECT UNIQUE', 'SELECT DISTINCT', 'SELECT DIFFERENT', 'SELECT ONLY'], answer: 1 },
      { question: 'Một quan hệ ở dạng chuẩn 3NF khi nào?', options: ['Đạt 1NF và không có thuộc tính đa trị', 'Đạt 2NF và không có phụ thuộc bắc cầu vào khóa', 'Mọi thuộc tính đều là khóa', 'Không có khóa ngoại'], answer: 1 },
      { question: 'Thuộc tính ACID nào đảm bảo giao dịch đã commit không bị mất khi hệ thống gặp sự cố?', options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], answer: 3 },
      { question: 'Phép JOIN nào trả về tất cả các dòng của bảng bên trái kể cả khi không khớp?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'], answer: 1 },
      { question: 'Chỉ mục (index) trong CSDL chủ yếu giúp cải thiện điều gì?', options: ['Tốc độ truy vấn tìm kiếm', 'Dung lượng lưu trữ', 'Tính toàn vẹn tham chiếu', 'Bảo mật dữ liệu'], answer: 0 },
    ],
    essay: [
      { question: 'Thiết kế lược đồ CSDL quan hệ (tối thiểu 4 bảng) cho hệ thống quản lý đăng ký học phần, chỉ rõ khóa chính và khóa ngoại.', guide: 'Có các bảng SinhVien, MonHoc, LopHocPhan, DangKy; khóa chính đúng; khóa ngoại thể hiện quan hệ n-n qua bảng DangKy.', points: 4 },
      { question: 'Trình bày khái niệm phụ thuộc hàm và quy trình chuẩn hóa một quan hệ từ 1NF lên 3NF, có ví dụ minh họa.', guide: 'Định nghĩa phụ thuộc hàm; nêu điều kiện 1NF, 2NF, 3NF; ví dụ tách bảng loại bỏ phụ thuộc bộ phận và bắc cầu.', points: 3 },
      { question: 'Viết truy vấn SQL liệt kê 5 sinh viên có điểm trung bình cao nhất của từng khoa.', guide: 'Dùng GROUP BY/AVG, hàm cửa sổ ROW_NUMBER() hoặc truy vấn con; lọc thứ hạng ≤ 5.', points: 3 },
    ],
  },
  CN410: {
    mcq: [
      { question: 'Thuật toán A* sử dụng hàm đánh giá nào?', options: ['f(n) = g(n)', 'f(n) = h(n)', 'f(n) = g(n) + h(n)', 'f(n) = g(n) × h(n)'], answer: 2 },
      { question: 'Heuristic h(n) được gọi là chấp nhận được (admissible) khi nào?', options: ['Không bao giờ đánh giá quá chi phí thực tế đến đích', 'Luôn bằng 0', 'Lớn hơn chi phí thực tế', 'Tăng dần theo độ sâu'], answer: 0 },
      { question: 'Thuật toán Minimax thường được áp dụng cho bài toán nào?', options: ['Phân cụm dữ liệu', 'Trò chơi đối kháng hai người', 'Tìm đường ngắn nhất', 'Nhận dạng giọng nói'], answer: 1 },
      { question: 'Cắt tỉa Alpha-Beta giúp cải thiện điều gì cho Minimax?', options: ['Độ chính xác kết quả', 'Số nút cần duyệt', 'Bộ nhớ của heuristic', 'Khả năng học'], answer: 1 },
      { question: 'Trong học có giám sát, dữ liệu huấn luyện bắt buộc phải có gì?', options: ['Nhãn đầu ra', 'Ảnh màu', 'Dữ liệu chuỗi thời gian', 'Số chiều nhỏ'], answer: 0 },
      { question: 'BFS (tìm kiếm theo chiều rộng) đảm bảo điều gì với đồ thị có chi phí cạnh bằng nhau?', options: ['Tìm lời giải nông nhất', 'Dùng ít bộ nhớ nhất', 'Không bao giờ lặp', 'Luôn nhanh hơn DFS'], answer: 0 },
    ],
    essay: [
      { question: 'Mô hình hóa bài toán 8-puzzle dưới dạng không gian trạng thái và đề xuất hai heuristic chấp nhận được cho A*.', guide: 'Trạng thái, hành động, trạng thái đích; heuristic số ô sai vị trí và tổng khoảng cách Manhattan; giải thích vì sao admissible.', points: 4 },
      { question: 'So sánh tìm kiếm mù và tìm kiếm có thông tin, cho ví dụ thuật toán của mỗi loại.', guide: 'Nêu khái niệm, độ phức tạp, tính đầy đủ/tối ưu; ví dụ BFS/DFS và Greedy/A*.', points: 3 },
      { question: 'Trình bày một ứng dụng thực tế của trí tuệ nhân tạo trong giáo dục và phân tích các rủi ro đạo đức.', guide: 'Ứng dụng cụ thể (gợi ý lộ trình học, chấm tự động…); rủi ro thiên lệch, quyền riêng tư, minh bạch.', points: 3 },
    ],
  },
  CN601: {
    mcq: [
      { question: 'Kỹ thuật regularization L2 thêm vào hàm mất mát thành phần nào?', options: ['Tổng trị tuyệt đối trọng số', 'Tổng bình phương trọng số', 'Số lượng tham số', 'Độ lệch chuẩn dữ liệu'], answer: 1 },
      { question: 'Hiện tượng overfitting được nhận biết rõ nhất khi nào?', options: ['Lỗi huấn luyện và kiểm định đều cao', 'Lỗi huấn luyện thấp, lỗi kiểm định cao', 'Lỗi kiểm định thấp hơn lỗi huấn luyện', 'Mô hình hội tụ chậm'], answer: 1 },
      { question: 'Cơ chế attention trong Transformer tính trọng số dựa trên gì?', options: ['Tích vô hướng giữa Query và Key', 'Khoảng cách Euclid giữa các token', 'Tần suất xuất hiện từ', 'Độ dài câu'], answer: 0 },
      { question: 'Gradient boosting xây dựng mô hình theo cách nào?', options: ['Huấn luyện song song các cây độc lập', 'Thêm tuần tự các mô hình yếu sửa lỗi phần dư', 'Chọn ngẫu nhiên đặc trưng cho mỗi cây', 'Giảm chiều dữ liệu trước khi học'], answer: 1 },
      { question: 'Chỉ số nào phù hợp nhất khi dữ liệu phân loại mất cân bằng nặng?', options: ['Accuracy', 'F1-score', 'MSE', 'R²'], answer: 1 },
      { question: 'Dropout trong mạng nơ-ron có tác dụng chính là gì?', options: ['Tăng tốc suy luận', 'Giảm overfitting', 'Tăng số tham số', 'Chuẩn hóa đầu vào'], answer: 1 },
    ],
    essay: [
      { question: 'Phân tích sự đánh đổi bias–variance và đề xuất chiến lược chọn mô hình cho tập dữ liệu nhỏ, nhiều đặc trưng.', guide: 'Giải thích bias/variance; dùng regularization, giảm chiều, cross-validation, mô hình đơn giản hoặc ensemble.', points: 4 },
      { question: 'Trình bày kiến trúc Transformer và lý do nó thay thế RNN trong nhiều bài toán xử lý ngôn ngữ.', guide: 'Self-attention, multi-head, positional encoding; song song hóa, phụ thuộc xa.', points: 3 },
      { question: 'Đề xuất quy trình đánh giá một mô hình dự báo học viên có nguy cơ bỏ học.', guide: 'Chia dữ liệu theo thời gian, chỉ số recall/F1, kiểm tra công bằng giữa nhóm, giám sát sau triển khai.', points: 3 },
    ],
  },
  CN201: {
    mcq: [
      { question: 'Độ phức tạp thời gian trung bình của tìm kiếm nhị phân là?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], answer: 1 },
      { question: 'Cấu trúc dữ liệu nào hoạt động theo nguyên tắc LIFO?', options: ['Hàng đợi', 'Ngăn xếp', 'Cây nhị phân', 'Bảng băm'], answer: 1 },
      { question: 'Thuật toán sắp xếp nào có độ phức tạp xấu nhất O(n log n)?', options: ['Quick sort', 'Merge sort', 'Bubble sort', 'Insertion sort'], answer: 1 },
      { question: 'Duyệt cây nhị phân tìm kiếm theo thứ tự nào cho dãy khóa tăng dần?', options: ['Tiền thứ tự', 'Trung thứ tự', 'Hậu thứ tự', 'Theo mức'], answer: 1 },
      { question: 'Thuật toán Dijkstra không áp dụng đúng khi đồ thị có gì?', options: ['Cạnh trọng số âm', 'Chu trình', 'Nhiều đỉnh', 'Cạnh vô hướng'], answer: 0 },
      { question: 'Xung đột (collision) xảy ra trong cấu trúc nào?', options: ['Danh sách liên kết', 'Bảng băm', 'Ngăn xếp', 'Mảng tĩnh'], answer: 1 },
    ],
    essay: [
      { question: 'Cài đặt (giả mã) thuật toán Quick sort và phân tích độ phức tạp trong trường hợp tốt nhất, xấu nhất.', guide: 'Chọn pivot, phân hoạch, đệ quy; O(n log n) và O(n²), cách tránh trường hợp xấu.', points: 4 },
      { question: 'So sánh danh sách liên kết và mảng động về thao tác chèn, xóa và truy cập.', guide: 'Truy cập O(1) vs O(n); chèn/xóa giữa; bộ nhớ liên tục và cache.', points: 3 },
      { question: 'Mô tả cách dùng đồ thị và BFS để tìm số bước ít nhất giữa hai trạng thái của một bài toán.', guide: 'Mô hình đỉnh/cạnh, hàng đợi, mảng đã thăm, truy vết đường đi.', points: 3 },
    ],
  },
}
