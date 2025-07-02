export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center mb-3 lg:mb-4">
              <img 
                src="/attached_assets/ChatGPT_Image_Jun_25__2025__02_32_00_AM-removebg-preview_1750807971844.png" 
                alt="براق" 
                className="h-12 w-12 mr-3 object-contain"
              />
              <h3 className="text-xl sm:text-2xl font-bold">براق 🇸🇦</h3>
            </div>
            <p className="text-gray-300 mb-4 lg:mb-6 leading-relaxed text-sm sm:text-base">
              المنصة الأولى في المملكة للعروض والخصومات من أفضل المتاجر والمطاعم والخدمات.
              انضم إلينا واكتشف أفضل العروض في مدينتك.
            </p>
            <div className="flex space-x-reverse space-x-4">
              <a 
                href="#" 
                className="bg-green-600 p-3 rounded-lg hover:bg-green-700 transition-colors"
                aria-label="واتساب"
              >
                <i className="fab fa-whatsapp text-xl"></i>
              </a>
              <a 
                href="#" 
                className="bg-pink-600 p-3 rounded-lg hover:bg-pink-700 transition-colors"
                aria-label="انستغرام"
              >
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a 
                href="#" 
                className="bg-yellow-500 p-3 rounded-lg hover:bg-yellow-600 transition-colors"
                aria-label="سناب شات"
              >
                <i className="fab fa-snapchat-ghost text-xl"></i>
              </a>
              <a 
                href="#" 
                className="bg-blue-600 p-3 rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="تويتر"
              >
                <i className="fab fa-twitter text-xl"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  عن المنصة
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  كيف تعمل
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  الأسئلة الشائعة
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  اتصل بنا
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  سياسة الخصوصية
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">للتجار</h4>
            <ul className="space-y-2">
              <li>
                <a href="/auth" className="text-gray-300 hover:text-white transition-colors">
                  تسجيل تاجر جديد
                </a>
              </li>
              <li>
                <a href="/auth" className="text-gray-300 hover:text-white transition-colors">
                  دخول التجار
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  الأسعار والباقات
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  دليل الاستخدام
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  الدعم الفني
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 lg:mt-8 pt-6 lg:pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 براق - جميع الحقوق محفوظة
          </p>
          <div className="flex items-center space-x-reverse space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              الشروط والأحكام
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              سياسة الخصوصية
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              سياسة الإرجاع
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
