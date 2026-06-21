import { Settings2 } from "lucide-react";

const UtilitiesTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          Tiện ích bổ sung
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Các công cụ hỗ trợ công việc và năng suất hàng ngày
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            name: "Ghi chú nhanh",
            desc: "Tạo ghi chú trong 1 click",
          },
          {
            name: "Bộ nhắc nhở",
            desc: "Đặt lời nhắc cho công việc",
          },
          {
            name: "Bản đánh giá",
            desc: "Đánh giá năng suất hàng ngày",
          },
          {
            name: "Danh sách việc cần làm",
            desc: "Quản lý danh sách công việc",
          },
        ].map((utility, idx) => (
          <button
            key={idx}
            className="p-4 bg-muted/20 border border-border/40 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left group cursor-pointer"
          >
            <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              {utility.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {utility.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UtilitiesTab;
