const Department = require("../models/department") ;

const createDepartment = async (req, res, next) => {
    try{
        const {departmentName , description , headId} = req.body ;
        const department = new Department({departmentName , description , headId}) ;
        const savedDepartment = await department.save() ;
        res.status(201).json({msg: "department created successfully", savedDepartment}) ;
    } catch (err){
        next(err) ;
    }
}

const getAllDepartments = async (req, res, next) => {
    try{
        const departments = await Department.find() ;
        res.status(200).json({msg: "all departments", departments}) ;
    } catch (err){
        next(err) ;
    }
}

const getDepartmentById = async (req, res, next) => {
    try{
        const id = req.params.id ;
        const department = await Department.findById(id) ;
        if(!department) return res.status(404).json({err: "no department found"})
        res.status(200).json({msg: "department with this id", department}) ;
    } catch (err){
        next(err) ;
    }
}

const updateDepartmentById = async (req, res, next) => {
    try{
        const id = req.params.id ;
        const {departmentName, description, headId} = req.body ;
        const updatedDepartment = await Department.findByIdAndUpdate(id, {departmentName, description, headId}, {returnDocument: 'after', runValidators: true}) ;
        res.status(200).json({msg: "department updated successfully", updatedDepartment}) ;
    } catch (err){
        next(err) ;
    }
}

const deleteDepartmentById = async (req, res, next) => {
    try{
        const id = req.params.id ;
        const deletedDepartment = await Department.findByIdAndDelete(id) ;
        res.status(200).json({msg: "department deleted successfully", deletedDepartment}) ;
    } catch (err){
        next(err) ;
    }
}


module.exports = { createDepartment, getAllDepartments, getDepartmentById, updateDepartmentById, deleteDepartmentById } ;