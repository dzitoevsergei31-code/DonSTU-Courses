import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

type RegisterFormInputs = {
  fullName?: string;
  email: string;
  password: string;
  confirmedPassword?: string;
  agreeTerms: boolean;
};

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checked, setChecked] = useState(false);
  const [formState, setFormState] = useState<'register' | 'login'>('register');

  const navigate = useNavigate();

  const {login} = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmedPassword: '',
      agreeTerms: false,
    },
  });

  const onSubmit = async (fields: RegisterFormInputs) => {
    try {
      if (formState == 'register' && fields.password !== fields.confirmedPassword) {
        return toast.error('Пароли не совпадают');
      }
      let formData = {}
      if (formState == 'register'){
        formData = {
          fullName: fields.fullName,
          email: fields.email,
          password: fields.password,
        }
      } else {
        formData = {
          email: fields.email,
          password: fields.password
        }
      }

      const res = await login(formState, formData);
      
      if(res){
        navigate('/');
      }
      
    } catch (error: unknown) {
        const message = (error as Error).message || 'Произошла ошибка';
        toast.error(message);
        console.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAFAFA] via-white to-[#718FDD]/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <span className="text-3xl font-bold bg-linear-to-r from-[#003071] to-[#9C27B0] bg-clip-text text-transparent">
              ДГТУ Курсы
            </span>
          </div>
          <h2 className="text-4xl font-bold text-[#0F0F0F] mb-4">
            {formState === 'register' ? 'Создайте аккаунт' : 'Войдите в аккаунт'}
          </h2>
          <p className="text-xl text-gray-600">
            {formState === 'register'
              ? 'Присоединяйтесь к образовательной платформе ДГТУ'
              : 'Добро пожаловать обратно!'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-8 hover:shadow-xl transition-all duration-500">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {formState === 'register' && (
              <div className="group">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-3">
                  Полное имя
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-[#718FDD] transition-colors" />
                  <input
                    {...register('fullName', { required: true })}
                    id="fullName"
                    type="text"
                    className="pl-12 pr-4 py-4 w-full bg-white/50 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#718FDD] focus:border-transparent transition-all duration-300 group-hover:border-[#718FDD]/40"
                    placeholder="Иван Иванов"
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1">Имя обязательно</p>}
              </div>
            )}

            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
                Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-[#718FDD] transition-colors" />
                <input
                  {...register('email', { required: true })}
                  id="email"
                  type="email"
                  className="pl-12 pr-4 py-4 w-full bg-white/50 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#718FDD] focus:border-transparent transition-all duration-300 group-hover:border-[#718FDD]/40"
                  placeholder="ivan.ivanov@donstu.ru"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">Email обязателен</p>}
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-3">
                Пароль
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-[#718FDD] transition-colors" />
                <input
                  {...register('password', { required: true, minLength: 6 })}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="pl-12 pr-12 py-4 w-full bg-white/50 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#718FDD] focus:border-transparent transition-all duration-300 group-hover:border-[#718FDD]/40"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#718FDD] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">Пароль обязателен и не менее 6 символов</p>}
            </div>

            {formState === 'register' && (
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-3">
                  Подтвердите пароль
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-[#718FDD] transition-colors" />
                  <input
                    {...register('confirmedPassword', { required: true })}
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="pl-12 pr-12 py-4 w-full bg-white/50 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#718FDD] focus:border-transparent transition-all duration-300 group-hover:border-[#718FDD]/40"
                    placeholder="••••••••"
                  />
                  <button
                    type="submit"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#718FDD] transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {formState === 'register' && (
              <div className="flex items-center space-x-3">
                <input
                  {...register('agreeTerms', { required: true })}
                  id="agreeTerms"
                  type="checkbox"
                  checked={checked}
                  onChange={() => setChecked((prev) => !prev)}
                  className="sr-only"
                />
                <label
                  htmlFor="agreeTerms"
                  className={`w-5 h-5 border border-[#003071] rounded-sm transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer ${
                    checked ? 'bg-[#003071]' : 'bg-white'
                  }`}
                >
                  {checked && <Check className="w-3 h-3 text-white" />}
                </label>
                <label htmlFor="agreeTerms" className="text-sm text-gray-700 cursor-pointer">
                  Я согласен с{' '}
                  <a href="#" className="text-[#003071] hover:text-[#718FDD] transition-colors font-semibold">
                    условиями использования
                  </a>
                </label>
              </div>
            )}
            {errors.agreeTerms && (
              <p className="text-red-500 text-xs">Вы должны принять условия</p>
            )}

            <button
              type="submit"
              className="w-full group bg-linear-to-r from-[#003071] to-[#718FDD] text-white py-4 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 hover:from-[#718FDD] hover:to-[#003071] transition-all duration-300 flex items-center justify-center gap-3"
            >
              <span>{formState === 'register' ? 'Зарегистрироваться' : 'Войти'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {formState === 'register' ? 'Уже есть аккаунт?' : 'Ещё нет аккаунта?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setFormState((prev) => (prev === 'register' ? 'login' : 'register'));
                    reset();
                    setChecked(false);
                  }}
                  className="font-semibold text-[#003071] hover:text-[#718FDD] transition-colors"
                >
                  {formState === 'register' ? 'Войти' : 'Зарегистрироваться'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};