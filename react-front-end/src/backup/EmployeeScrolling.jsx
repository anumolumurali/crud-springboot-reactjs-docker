import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Loader from "../components/Loader";
import EmployeeService from "../Services/EmployeeService";


const EmployeeScrolling = () => {
  const [employees, setEmployees] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
   EmployeeService.getEmployees(index,100)
        .then((res) => setEmployees(res.content))
        .catch(err => console.log(err));
  }, []);

  const fetchMoreData = () => {
       EmployeeService.getEmployees(index,100)
      .then((res) => {
        setEmployees((prevItems) => [...prevItems, ...res.content]);
        res.data.length > 0 ? setHasMore(true) : setHasMore(false);
      })
      .catch((err) => console.log(err));

    setIndex((prevIndex) => prevIndex + 1);
  };

  return (
    <>
    <InfiniteScroll
      dataLength={employees.length}
      next={fetchMoreData}
      hasMore={hasMore}
      loader={<Loader />}
    >
      <div className='container'>
        <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                    <th>Employee FirstName</th>
                    <th>Employee LastName</th>
                    <th>Employee BirthDate</th>
                    </tr>
                </thead>
          <div className='row'>
            {employees &&
              employees.map((employee) => 
                  <tbody>
                      <tr key= {employee.id}>
                        <td key={employee.firstName}>{employee.firstName}</td>
                        <td key={employee.lastName}>{employee.lastName}</td>
                        <td key={employee.birthDate}>{employee.birthDate}</td>
                      </tr>
                      
                  </tbody>)
            }
          </div>
        </table>
      </div>
    </InfiniteScroll>
    </>
  );
};

export default EmployeeScrolling;