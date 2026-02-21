import { Navigate, Route, Routes } from "react-router-dom"
import {Header} from './components/header';
import {Footer} from './components/footer';
import {Dashboard} from './pages/dashboard';
import {Courses} from './pages/courses';
import {CourseTopics} from './pages/course-topics';
import {TopicDetail} from './pages/topic-detail';
import {Achievements} from './pages/achievements';
import {Profile} from './pages/profile';
import {Register} from './pages/register';
import { Quiz } from './pages/quiz';
import { TopicContent } from './pages/topic-content';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { Loader } from "./components/loader";

function App() {
	const {authUser, loading} = useContext(AuthContext);
	console.log(authUser);
	
	if (loading) {
		return (
			<Loader />
		);
	}

	return (
		<div className="min-h-screen bg-[#FAFAFA]">
			<Toaster />
			<Header />
			<main>
				<Routes>
					<Route path="/" element={authUser ? <Dashboard /> : <Navigate to='/login' />} />
					<Route path="/courses" element={authUser ? <Courses /> : <Navigate to='/login' />} />
					<Route path="/courses/:courseId" element={authUser ? <CourseTopics /> : <Navigate to='/login' />} />
					<Route path="/courses/:courseId/topics/:topicId" element={authUser ? <TopicDetail /> : <Navigate to='/login' />} />
					<Route path="/courses/:courseId/topics/:topicId/quiz" element={authUser ? <Quiz /> : <Navigate to='/login' />} />
					<Route path="/courses/:courseId/topics/:topicId/content" element={authUser ? <TopicContent /> : <Navigate to='/login' />} />
					<Route path="/achievements" element={authUser ? <Achievements /> : <Navigate to='/login' />} />
					<Route path="/profile" element={authUser ? <Profile /> : <Navigate to='/login' />} />
					<Route path="/login" element={!authUser ? <Register /> : <Navigate to='/' />} />
				</Routes>
			</main>
			<Footer />
		</div>
	);
}

export default App;