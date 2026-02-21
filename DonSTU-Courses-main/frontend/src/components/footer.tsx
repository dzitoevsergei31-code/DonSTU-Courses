export const Footer: React.FC = () => {
  return (
    <footer className="bg-linear-to-b from-white to-[#718FDD]/10 border-t border-[#718FDD]/20 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src="/logoo.png" 
              alt="ДГТУ Курсы" 
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Инновационная образовательная платформа Донского государственного технического университета
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#0F0F0F] mb-4 text-lg">Навигация</h4>
            <div className="space-y-3">
              <a href="/courses" className="block text-gray-600 hover:text-[#003071] transition-colors duration-300 hover:translate-x-1 transform">
                Все курсы
              </a>
              <a href="/achievements" className="block text-gray-600 hover:text-[#003071] transition-colors duration-300 hover:translate-x-1 transform">
                Достижения
              </a>
              <a href="/profile" className="block text-gray-600 hover:text-[#003071] transition-colors duration-300 hover:translate-x-1 transform">
                Профиль
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#0F0F0F] mb-4 text-lg">Контакты</h4>
            <div className="space-y-3 text-gray-600">
              <p className="hover:text-[#003071] transition-colors duration-300 cursor-pointer">г. Ростов-на-Дону</p>
              <p className="hover:text-[#003071] transition-colors duration-300 cursor-pointer">пл. Гагарина, 1</p>
              <p className="hover:text-[#003071] transition-colors duration-300 cursor-pointer">+7 (800) 100-19-30</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-[#718FDD]/20 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">© 2025 ДГТУ Курсы. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}