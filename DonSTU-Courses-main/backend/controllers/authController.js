// authController.js
import { generateToken, getNameParts } from "../libs/libs.js";
import { User, Profile } from "../models/index.js";
import bcrypt from 'bcryptjs';
import cloudinary from 'cloudinary';

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const register = async(req, res) => {
	try {
		console.log(req.body)
		const {fullName, email, password} = req.body;
		if (!fullName || !email || !password) {
			return res.json({success:false, message:'Не достаточно данных для регистрации'});
		}

		const user = await User.findOne({
			where: {
				email
			},
		})
		if(user) {
			return res.json({
				success: false,
				message: 'Пользователь с таким email уже существует'
			})
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const {firstName, lastName} = getNameParts(fullName);

		const newUser = await User.create({
			email,
			password: hashedPassword,
			lastLogin: new Date(),
		})

		await Profile.create({
			userId: newUser.id,
			firstName,
			lastName,
		})

		// Получаем пользователя с профилем для ответа
		const createdUser = await User.findOne({
			where: { id: newUser.id },
			include: [
				{
					model: Profile,
					as: 'profile',
				}
			]
		})

		const token = generateToken(newUser.id)

		res.json({
			success: true,
			message: 'Пользователь успешно зарегистрирован',
			token,
			user: {
				id: createdUser.id,
				email: createdUser.email,	
				profile: createdUser.profile.dataValues,
			}
		})

	} catch (error) {
		res.json({success: false, message: error.message})
	}
}

export const login = async(req, res) => {
	try {
		const {email, password} = req.body;
		if (!email || !password) {
			return res.json({success:false, message:'Не достаточно данных для входа'});
		}

		console.log(User.associations)

		const user = await User.findOne({
			where:{
				email,
			},
			include: [
				{
					model: Profile,
					as: 'profile',
				}
			]
		})
		if(!user) {
			return res.json({
				success: false,
				message: 'Пользователь с таким email не найден'
			})
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if(!isPasswordCorrect){
			return res.json({
				success: false,
				message: 'Неверный пароль'
			})
		}

		const token = generateToken(user.id);

		res.json({
			success: true,
			message: 'Пользователь успешно авторизован',
			token,
			user: {
				id: user.id,
				email: user.email,
				profile: user.profile.dataValues,
			}
		})

	} catch (error) {
		res.json({success: false, message: error.message})
	}
}

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findOne({
			where: {
				id: req.user.id
			},
			include: [{
				model: Profile,
				as: 'profile',
			}]
		})

		if (!user) {
			return res.json({
				success: false,
				message: 'User not found'
			});
		}

		res.json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				profile: user.profile.dataValues,
			}
		});
	} catch (error) {
		console.error('Check auth error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error'
		});
	}
}

export const getProfile = async (req, res) => {
	try {
		const userId = req.user.id;

		const user = await User.findOne({
			where: { id: userId },
			include: [
				{
					model: Profile,
					as: 'profile',
					attributes: { exclude: ['id', 'userId'] }
				}
			],
			attributes: { exclude: ['password'] }
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'Пользователь не найден'
			});
		}

		const profileData = {
			fullName: `${user.profile.firstName} ${user.profile.lastName}`,
			email: user.email,
			phone: user.profile.phone || '',
			location: user.profile.location || '',
			bio: user.profile.bio || '',
			avatar: user.profile.avatar || '',
			dateOfBirth: user.profile.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : '',
			registrationDate: new Date(user.registrationDate).toLocaleDateString('ru-RU'),
			statistics: {
				averageScore: user.profile.averageScore || 0,
				activeCourses: user.profile.activeCourses || 0,
				completedTopics: user.profile.completedTopics || 0,
				totalStudyTime: user.profile.totalStudyTime || 0
			}
		};

		res.json({
			success: true,
			profile: profileData
		});
	} catch (error) {
		console.error('Get profile error:', error);
		res.status(500).json({
			success: false,
			message: 'Ошибка при получении профиля'
		});
	}
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, bio, dateOfBirth, avatar } = req.body;

    const user = await User.findOne({
      where: { id: userId },
      include: [{ model: Profile, as: 'profile' }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    let firstName = '';
    let lastName = '';
    
    if (fullName) {
      const nameParts = fullName.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // ИСПРАВЛЕНИЕ: Правильная обработка даты рождения
    const updateData = {
      firstName: firstName || user.profile.firstName,
      lastName: lastName || user.profile.lastName,
      bio: bio !== undefined ? bio : user.profile.bio,
    };

    // Обработка даты рождения
    if (dateOfBirth !== undefined) {
      if (dateOfBirth === '' || dateOfBirth === null) {
        // Если дата очищена, устанавливаем null
        updateData.dateOfBirth = null;
      } else {
        // Проверяем валидность даты
        const parsedDate = new Date(dateOfBirth);
        if (!isNaN(parsedDate.getTime())) {
          updateData.dateOfBirth = parsedDate;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Неверный формат даты'
          });
        }
      }
    } else {
      // Сохраняем существующее значение
      updateData.dateOfBirth = user.profile.dateOfBirth;
    }

    // Если есть новое изображение, загружаем в Cloudinary
    if (avatar && avatar.startsWith('data:image')) {
      try {
        const uploadResult = await cloudinary.uploader.upload(avatar, {
          folder: 'user_avatars',
          transformation: [
            { width: 300, height: 300, crop: 'fill' },
            { quality: 'auto' },
            { format: 'webp' }
          ]
        });
        updateData.avatar = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Ошибка при загрузке изображения'
        });
      }
    } else if (avatar === '' || avatar === null) {
      // Если аватар очищен
      updateData.avatar = null;
    }

    await Profile.update(updateData, { where: { userId } });

    const updatedUser = await User.findOne({
      where: { id: userId },
      include: [{ model: Profile, as: 'profile' }],
      attributes: { exclude: ['password'] }
    });

    const updatedProfileData = {
      fullName: `${updatedUser.profile.firstName} ${updatedUser.profile.lastName}`,
      email: updatedUser.email,
      bio: updatedUser.profile.bio || '',
      avatar: updatedUser.profile.avatar || '',
      dateOfBirth: updatedUser.profile.dateOfBirth ? 
        new Date(updatedUser.profile.dateOfBirth).toISOString().split('T')[0] : '',
      registrationDate: new Date(updatedUser.registrationDate).toLocaleDateString('ru-RU'),
      statistics: {
        averageScore: updatedUser.profile.averageScore || 0,
        activeCourses: updatedUser.profile.activeCourses || 0,
        completedTopics: updatedUser.profile.completedTopics || 0,
        totalStudyTime: updatedUser.profile.totalStudyTime || 0
      }
    };

    res.json({
      success: true,
      message: 'Профиль успешно обновлен',
      profile: updatedProfileData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении профиля'
    });
  }
}

export const changePassword = async (req, res) => {
	try {
		const userId = req.user.id;
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				success: false,
				message: 'Требуется текущий и новый пароль'
			});
		}

		const user = await User.findOne({ where: { id: userId } });

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'Пользователь не найден'
			});
		}

		const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
		if (!isCurrentPasswordCorrect) {
			return res.status(400).json({
				success: false,
				message: 'Текущий пароль неверен'
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedNewPassword = await bcrypt.hash(newPassword, salt);

		// Обновляем пароль
		await User.update(
			{ password: hashedNewPassword },
			{ where: { id: userId } }
		);

		res.json({
			success: true,
			message: 'Пароль успешно изменен'
		});
	} catch (error) {
		console.error('Change password error:', error);
		res.status(500).json({
			success: false,
			message: 'Ошибка при изменении пароля'
		});
	}
}