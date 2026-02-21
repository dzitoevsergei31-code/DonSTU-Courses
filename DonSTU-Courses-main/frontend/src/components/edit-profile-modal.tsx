// edit-profile-modal.tsx
import { X, Upload, User, Mail, BookOpen, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { UserProfile } from '../@types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserProfile | null;
  onSave: (data: Partial<UserProfile>) => Promise<boolean>;
}

interface FormData {
  fullName: string;
  email: string;
  bio: string;
  dateOfBirth: string;
  avatar?: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, userData, onSave }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    defaultValues: {
      fullName: '',
      email: '',
      bio: '',
      dateOfBirth: '',
      avatar: ''
    }
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(userData?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && userData) {
      reset({
        fullName: userData.fullName || '',
        email: userData.email || '',
        bio: userData.bio || '',
        dateOfBirth: userData.dateOfBirth || '',
        avatar: userData.avatar || ''
      });
      setAvatarPreview(userData.avatar || '');
      setSelectedImage(null);
    }
  }, [isOpen, userData, reset]);

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, ...updateData } = data;
      
      const finalData: Partial<UserProfile> = { 
        fullName: updateData.fullName,
        bio: updateData.bio,
        // Конвертируем пустые строки в undefined для совместимости с UserProfile
        dateOfBirth: updateData.dateOfBirth || undefined,
        avatar: updateData.avatar || undefined
      };
      
      if (selectedImage) {
        try {
          const base64Image = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                resolve(e.target.result as string);
              } else {
                reject(new Error('Ошибка чтения файла'));
              }
            };
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsDataURL(selectedImage);
          });
          
          finalData.avatar = base64Image;
        } catch (error) {
          console.error('Error converting image:', error);
          toast.error('Ошибка при обработке изображения');
          return;
        }
      } else if (data.avatar === '') {
        // Если avatar пустая строка, устанавливаем undefined
        finalData.avatar = undefined;
      }
      
      const success = await onSave(finalData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Ошибка при сохранении профиля');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Создаем предпросмотр
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = (): void => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#718FDD]/20 w-full max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#718FDD]/20 sticky top-0 bg-white/95 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-[#0F0F0F]">Редактировать профиль</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-300"
            disabled={isSubmitting}
            type="button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Avatar Upload */}
          <div className="flex justify-center mb-4">
            <div className="relative group">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Аватар" 
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-[#003071] to-[#718FDD] rounded-2xl flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <button 
                type="button"
                onClick={triggerFileInput}
                disabled={isSubmitting}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#003071] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Полное имя *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                {...register('fullName', { 
                  required: 'Обязательное поле',
                  minLength: { value: 2, message: 'Минимум 2 символа' },
                  maxLength: { value: 50, message: 'Максимум 50 символов' }
                })}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#718FDD] focus:border-transparent transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Иван Иванов"
                disabled={isSubmitting}
              />
            </div>
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                {...register('email')}
                type="email"
                className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none transition-all duration-300 cursor-not-allowed"
                placeholder="ivan.ivanov@edu.dgtu.ru"
                disabled
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Email нельзя изменить</p>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата рождения
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                {...register('dateOfBirth')}
                type="date"
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#718FDD] focus:border-transparent transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              О себе
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <textarea
                {...register('bio', {
                  maxLength: { value: 500, message: 'Максимум 500 символов' }
                })}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#718FDD] focus:border-transparent transition-all duration-300 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Расскажите о себе..."
                disabled={isSubmitting}
              />
            </div>
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 sticky bottom-0 bg-white/95 backdrop-blur-sm pb-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-sm border border-[#718FDD]/20 text-[#0F0F0F] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#003071] to-[#718FDD] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Сохранение...
                </>
              ) : (
                'Сохранить'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};