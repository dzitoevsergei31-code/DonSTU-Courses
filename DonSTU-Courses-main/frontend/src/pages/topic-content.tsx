import { ChevronLeft, BookOpen, Clock, Share, ArrowRight } from 'lucide-react';
import { useState, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import type { AuthContextType, TopicContent as TopicContentType } from '../@types';

export const TopicContent: React.FC = () => {
  const [topic, setTopic] = useState<TopicContentType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { courseId, topicId } = useParams<{ courseId: string; topicId: string }>();
  const { axios } = useContext(AuthContext) as AuthContextType;

  const getTopicContent = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/courses/${courseId}/topics/${topicId}/content`);
      
      if (data.success) {
        setTopic(data.topic);
      }
    } catch (error) {
      const message = (error as Error).message || 'Произошла ошибка';
      toast.error(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId && topicId) {
      getTopicContent();
    }
  }, [courseId, topicId]);

  const updateProgress = async (): Promise<void> => {
    try {
      await axios.put(`/api/courses/${courseId}/topics/${topicId}/progress`, {
        progress: 100,
        completed: true
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Функция для преобразования простого текста в разметку
  const formatContent = (content: string): string => {
    if (!content) return '<p>Контент пока не добавлен...</p>';
    
    // Простое преобразование переносов строк в параграфы
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs.map(paragraph => {
      // Обработка заголовков
      if (paragraph.startsWith('# ')) {
        return `<h1 class="text-3xl font-bold text-[#0F0F0F] mb-4">${paragraph.slice(2)}</h1>`;
      } else if (paragraph.startsWith('## ')) {
        return `<h2 class="text-2xl font-bold text-[#0F0F0F] mt-8 mb-4">${paragraph.slice(3)}</h2>`;
      } else if (paragraph.startsWith('### ')) {
        return `<h3 class="text-xl font-bold text-[#0F0F0F] mt-6 mb-3">${paragraph.slice(4)}</h3>`;
      } else {
        return `<p class="text-lg leading-relaxed mb-4">${paragraph}</p>`;
      }
    }).join('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-white to-[#718FDD]/10 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-white to-[#718FDD]/10 py-8">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Контент не найден</h1>
          <Link 
            to={`/courses/${courseId}/topics/${topicId}`}
            className="text-[#003071] hover:underline"
          >
            Вернуться к уроку
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAFAFA] via-white to-[#718FDD]/10 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <Link 
              to={`/courses/${courseId}/topics/${topicId}`}
              className="group flex items-center space-x-2 text-[#003071] hover:text-[#718FDD] transition-colors duration-300"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Назад к уроку</span>
            </Link>
            
            <div className="h-6 w-px bg-[#718FDD]/30"></div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Время чтения: {Math.ceil(topic.duration / 2)} минут</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-3 bg-white/80 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl text-[#718FDD] hover:shadow-lg hover:border-[#718FDD]/40 transition-all duration-300 group">
              <Share className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-8 hover:shadow-xl transition-all duration-500">
          {/* Article Header */}
          <header className="mb-8 pb-6 border-b border-[#718FDD]/20">
            <div className="flex items-center space-x-3 text-sm text-gray-600 mb-4">
              <span className="px-3 py-1 bg-[#003071]/10 text-[#003071] rounded-full font-medium">
                {topic.courseTitle}
              </span>
              <span>Обновлено: {new Date().toLocaleDateString('ru-RU')}</span>
            </div>
            
            <h1 className="text-4xl font-bold text-[#0F0F0F] mb-4 bg-gradient-to-r from-[#003071] to-[#9C27B0] bg-clip-text text-transparent">
              {topic.title}
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              {topic.description}
            </p>
          </header>

          {/* Content Body */}
          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-[#003071] to-[#718FDD] rounded-lg flex items-center justify-center mr-3">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                Теория по теме
              </h2>
            </div>

            <div 
              className="text-gray-700 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: formatContent(topic.content) }}
            />
          </div>

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t border-[#718FDD]/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Понравился материал?</span>
                <button className="px-4 py-2 bg-[#003071] text-white rounded-lg text-sm font-semibold hover:bg-[#718FDD] transition-colors duration-300">
                  Да, полезно!
                </button>
              </div>
              
              <Link 
                to={`/courses/${courseId}/topics/${topicId}/quiz`}
                onClick={updateProgress}
                className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#9C27B0] to-[#BA68C8] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 hover:from-[#BA68C8] hover:to-[#9C27B0] transition-all duration-300"
              >
                <span>Пройти квиз по теме</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};