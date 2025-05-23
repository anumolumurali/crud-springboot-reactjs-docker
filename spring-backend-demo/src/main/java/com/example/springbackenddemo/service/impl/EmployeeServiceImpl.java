package com.example.springbackenddemo.service.impl;

import com.example.springbackenddemo.exception.ResourceNotFoundException;
import com.example.springbackenddemo.model.Employee;
import com.example.springbackenddemo.repository.EmployeeRepository;
import com.example.springbackenddemo.service.EmployeeService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeServiceImpl implements EmployeeService {
    private EmployeeRepository employeeRepository;
    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }
    @Override
    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Override
    public List<Employee> getAllEmployees() {
        Pageable firstPageWithHunderedElements = PageRequest.of(0, 100);
        Page<Employee> employees = employeeRepository.findAll(firstPageWithHunderedElements);
        return employees.stream().collect(Collectors.toList());
    }

    @Override
    public Employee getEmployeeById(long id) {
//        Optional<Employee> employee = employeeRepository.findById(id);
//        if(employee.isPresent()) {
//            return employee.get();
//        } else {
//            throw new ResourceNotFoundException("Employee","Id",id);
//        }
        return employeeRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Employee","Id",id));
    }

    @Override
    public Employee updateEmployee(Employee employee, long id) {
        // we need to check whether employee with given ID exists in DB or not
        Employee existingEmployee = employeeRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Employee","id",id)
        );
        existingEmployee.setFirstName(employee.getFirstName());
        existingEmployee.setLastName(employee.getLastName());
        existingEmployee.setBirthDate(employee.getBirthDate());
        // save existing employee to DB
        employeeRepository.save(existingEmployee);
        return existingEmployee;

    }

    @Override
    public void deleteEmployee(long id) {
        // check whether an employee exist in a DB or not
        employeeRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Employee","Id",id));

        employeeRepository.deleteById(id);
    }
}
