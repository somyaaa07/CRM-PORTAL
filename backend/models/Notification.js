import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Notification = sequelize.define('Notification',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    userId:{
type:DataTypes.INTEGER,
allowNull:false
    },
    title:{
        type:DataTypes.STRING,
        allowNull:false
    },
    message:{
        type:DataTypes.STRING,
        allowNull:false
    },
    type:{
        type:DataTypes.ENUM('meta-lead','follow-up','system'),
        defaultValue:'system'
    },
    isRead:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    leadId:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
  
},
  {
        timestamps:true,
    })


    export default Notification