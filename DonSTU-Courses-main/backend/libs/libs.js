import jwt from 'jsonwebtoken';

export const getNameParts = (fullName) =>{
	const nameParts = fullName.trim().split(' ');
	const firstName = nameParts[0];
	const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
	return {
		firstName,
		lastName
	}
}

export const generateToken = (userId) => {
	const token = jwt.sign({userId}, process.env.JWT_SECRET);
	return token;
}