import { Leaf, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-green-900 text-green-50 mt-16">
      <div className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg"><Leaf className="w-5 h-5"/>Trade & Care Plants</div>
          <p className="mt-2 text-sm text-green-200">Mua sắm cây cảnh, cây ăn quả và tra cứu thông tin chăm sóc cây trồng.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Liên hệ</h4>
          <ul className="text-sm space-y-1 text-green-200">
            <li className="flex items-center gap-2"><Mail className="w-4 h-4"/>contact@tradecareplants.vn</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4"/>0900 123 456</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4"/>123 Đường Cây Xanh, TP. HCM</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Về chúng tôi</h4>
          <p className="text-sm text-green-200">Đồ án tốt nghiệp - Website hỗ trợ mua bán và chăm sóc cây trồng.</p>
        </div>
      </div>
      <div className="border-t border-green-800 text-center text-xs text-green-300 py-4">© 2026 Trade & Care Plants</div>
    </footer>
  );
}
