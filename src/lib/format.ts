export const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export const ORDER_STATUS_LABEL: Record<string, string> = {
  cho_xac_nhan: "Chờ xác nhận",
  dang_xu_ly: "Đang xử lý",
  hoan_thanh: "Hoàn thành",
  da_huy: "Đã hủy",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  cho_xac_nhan: "bg-yellow-100 text-yellow-800",
  dang_xu_ly: "bg-blue-100 text-blue-800",
  hoan_thanh: "bg-green-100 text-green-800",
  da_huy: "bg-red-100 text-red-800",
};
