import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
	process.env.DB_TABLE_NAME,
	process.env.DB_USER_NAME,
	process.env.DB_USER_PASSWORD,
	{
		dialect: 'postgres',
		host: 'localhost',
	}
)

const testConnection = async() => {
	try {
		await sequelize.authenticate();
		await sequelize.sync();
		console.log('Connection has been established successfully!');
	} catch (error) {
		console.log('Database was not connected because of: ', error)
	}
}

testConnection();

export default sequelize;