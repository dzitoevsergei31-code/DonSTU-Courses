import { ChevronRight, BookOpen, HelpCircle, Clock, CheckCircle, Play, FileText, Video, Download, Share } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import type { AuthContextType } from '../@types';

interface Resource {
  id: string;
  name: string;
  type: string;
  size?: string;
  url?: string;
}

interface TopicDetail {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl?: string;
  resources: Resource[];
  isCompleted: boolean;
  userProgress: number;
  course: {
    title: string;
    lessons: Array<{ id: string; title: string; order: number }>;
  };
  content?: string;
}

export const TopicDetail: React.FC = () => {
  const { courseId, topicId } = useParams<{ courseId: string; topicId: string }>();
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { axios } = useContext(AuthContext) as AuthContextType;

  const getTopicDetails = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/courses/${courseId}/topics/${topicId}`);
      
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
      getTopicDetails();
    }
  }, [courseId, topicId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Урок не найден</h1>
          <Link to={`/courses/${courseId}`} className="text-[#003071] hover:underline mt-4 inline-block">
            Вернуться к курсу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-8 mb-8 hover:shadow-xl transition-all duration-500">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/courses" className="hover:text-[#003071] transition-colors duration-300">Курсы</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/courses/${courseId}`} className="hover:text-[#003071] transition-colors duration-300">
            {topic.course?.title || 'Курс'}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#003071] font-medium">{topic.title}</span>
        </div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#0F0F0F] mb-4 bg-gradient-to-r from-[#003071] to-[#9C27B0] bg-clip-text text-transparent">
              {topic.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              {topic.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button className="p-3 bg-white/50 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl hover:shadow-lg hover:border-[#718FDD]/40 transition-all duration-300 group">
              <Share className="w-5 h-5 text-[#718FDD] group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-6 text-sm mb-6">
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#718FDD]/20">
            <Clock className="w-4 h-4 text-[#718FDD]" />
            <span className="text-[#0F0F0F] font-medium">{topic.duration} минут</span>
          </div>
          {topic.isCompleted && (
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#9C27B0]/20">
              <CheckCircle className="w-4 h-4 text-[#9C27B0]" />
              <span className="text-[#0F0F0F] font-medium">Пройдено</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#003071]/20">
            <FileText className="w-4 h-4 text-[#003071]" />
            <span className="text-[#0F0F0F] font-medium">{topic.resources?.length || 0} материалов</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {topic.videoUrl && (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-6 hover:shadow-xl transition-all duration-500">
    <h3 className="text-2xl font-bold text-[#0F0F0F] mb-4 flex items-center">
      <Video className="w-6 h-6 mr-3 text-[#003071]" />
      Видео-лекция
    </h3>
    
    <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
      <video
        controls
        className="w-full h-full"
        onTimeUpdate={(e) => {
          // Можно отслеживать прогресс просмотра
          const video = e.target as HTMLVideoElement;
          const progress = (video.currentTime / video.duration) * 100;
          console.log(`Прогресс просмотра: ${progress}%`);
        }}
        onEnded={() => {
          console.log('Видео завершено');
        }}
      >
        <source src={topic.videoUrl} type="video/mp4" />
        <source src={topic.videoUrl} type="video/webm" />
        Ваш браузер не поддерживает видео тег.
      </video>
    </div>
    
    <div className="flex justify-between items-center text-sm text-gray-600">
      <span>Длительность: {Math.floor(topic.duration / 60)}:{(topic.duration % 60).toString().padStart(2, '0')}</span>
    </div>
  </div>
)}

          {topic.resources && topic.resources.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-6 hover:shadow-xl transition-all duration-500">
              <h3 className="text-2xl font-bold text-[#0F0F0F] mb-4">Материалы для изучения</h3>
              <div className="space-y-3">
                {topic.resources.map((resource: Resource, index: number) => (
                  <div key={resource.id || index} className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-[#718FDD]/20 hover:border-[#718FDD]/40 transition-all duration-300 group">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#003071] to-[#718FDD] rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0F0F0F] group-hover:text-[#003071] transition-colors">
                          {resource.name || `Ресурс ${index + 1}`}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {resource.type || 'PDF'} • {resource.size || 'Неизвестный размер'}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 bg-white border border-[#718FDD]/20 rounded-lg hover:shadow-lg hover:scale-110 transition-all duration-300">
                      <Download className="w-4 h-4 text-[#718FDD]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-6 hover:shadow-xl transition-all duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#003071] to-[#718FDD] rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0F0F0F]">Теория</h3>
                <p className="text-gray-600 text-sm">Изучите теоретический материал</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Полное руководство по теме "{topic.title}" с примерами и практическими заданиями.
            </p>
            <Link 
              to={`/courses/${courseId}/topics/${topicId}/content`}
              className="w-full group/btn bg-gradient-to-r from-[#003071] to-[#718FDD] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 hover:from-[#718FDD] hover:to-[#003071] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              Читать теорию
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#9C27B0]/20 p-6 hover:shadow-xl transition-all duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#9C27B0] to-[#BA68C8] rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0F0F0F]">Квиз</h3>
                <p className="text-gray-600 text-sm">Проверьте свои знания</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Пройдите тестирование по материалам урока для закрепления знаний.
            </p>
            <Link 
              to={`/courses/${courseId}/topics/${topicId}/quiz`}
              className="w-full group/btn bg-gradient-to-r from-[#9C27B0] to-[#BA68C8] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 hover:from-[#BA68C8] hover:to-[#9C27B0] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              Начать квиз
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};