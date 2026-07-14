const Department = require("../models/department") ;

const createDepartment = async (req, res, next) => {
    try{
        const {departmentName , description , headName} = req.body ;
        const department = new Department({departmentName , description , headName}) ;
        const savedDepartment = await department.save() ;
        res.status(201).json({message: "department created successfully", data: savedDepartment}) ;
    } catch (err){
        next(err) ;
    }
}

const getAllDepartments = async (req, res, next) => {
    try{
        const departments = await Department.find() ;
        res.status(200).json({message: "all departments", data: departments}) ;
    } catch (err){
        next(err) ;
    }
} 

const getDepartmentById = async (req, res, next) => {
    try{
        const id = req.params.id ;
        const department = await Department.findById(id) ;
        if(!department) return res.status(404).json({err: "no department found"})
        res.status(200).json({message: "department with this id", data: department}) ;
    } catch (err){
        next(err) ;
    }
}

const updateDepartmentById = async (req, res, next) => {
    try{
        const id = req.params.id ;
        const {departmentName, description, headName} = req.body ;
        const updatedDepartment = await Department.findByIdAndUpdate(id, {departmentName, description, headName}, {returnDocument: 'after', runValidators: true}) ;
        res.status(200).json({message: "department updated successfully", data: updatedDepartment}) ;
    } catch (err){
        next(err) ;
    }
}

const deleteDepartmentById = async (req, res, next) => {
    try{
        const id = req.params.id ;
        const deletedDepartment = await Department.findByIdAndDelete(id) ;
        res.status(200).json({message: "department deleted successfully", data: deletedDepartment}) ;
    } catch (err){
        next(err) ;
    }
}


module.exports = { createDepartment, getAllDepartments, getDepartmentById, updateDepartmentById, deleteDepartmentById } ;