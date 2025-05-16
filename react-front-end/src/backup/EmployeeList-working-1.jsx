import React, { useState, useEffect, useCallback, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios'; // Import axios

const PAGE_SIZE = 10; // Define page size, should align with backend pagination
// const MAX_RECORDS_IN_MEMORY = 500; // Logic removed

// Placeholder for CSS styles if not using a separate file
const styles = `
.employee-list-container {
  max-width: 900px;
  margin: 30px auto;
  padding: 25px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f7f6;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.employee-list-container h1 {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
}

/* Styles for the outer div of each employee (card-like) */
.employee-card-div {
  border: 1px solid #d1d5db; /* Tailwind gray-300 */
  border-radius: 8px; /* Tailwind rounded-lg */
  padding: 16px; /* Tailwind p-4 */
  margin-bottom: 20px;
  background-color: #ffffff; /* Tailwind bg-white */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* Tailwind shadow-md */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.employee-card-div:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Tailwind shadow-lg */
}

/* Styles for the small table inside each employee card div */
.employee-details-table {
  width: 100%;
  border-collapse: collapse; /* Removes double borders */
}

.employee-details-table th,
.employee-details-table td {
  padding: 8px 12px; /* Tailwind p-2 or p-3 equivalent */
  text-align: left;
  font-size: 0.9em; /* Slightly smaller font for details */
  border-bottom: 1px solid #e5e7eb; /* Tailwind gray-200 for subtle row separation */
}

.employee-details-table th {
  font-weight: 600; /* Tailwind font-semibold */
  color: #4b5563; /* Tailwind gray-600 */
  width: 30%; /* Give some fixed width to headers for alignment */
}

.employee-details-table td {
  color: #1f2937; /* Tailwind gray-800 */
}

/* Remove border from the last row's cells in each table */
.employee-details-table tr:last-child th,
.employee-details-table tr:last-child td {
  border-bottom: none;
}


.loader,
.end-message,
.no-employees {
  padding: 25px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.no-employees {
  font-weight: bold;
}
`;

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [hasMoreState, setHasMoreState] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  // totalItemsFetchedSoFar is still useful for the dataLength prop,
  // even if we are not slicing the employees array for display.
  const [totalItemsFetchedSoFar, setTotalItemsFetchedSoFar] = useState(0);

  const isLoadingRef = useRef(isLoadingState);
  const hasMoreRef = useRef(hasMoreState);

  useEffect(() => {
    isLoadingRef.current = isLoadingState;
  }, [isLoadingState]);

  useEffect(() => {
    hasMoreRef.current = hasMoreState;
  }, [hasMoreState]);

  const fetchEmployeesAPI = useCallback(async (pageToFetch) => {
    if (isLoadingRef.current || (pageToFetch > 0 && !hasMoreRef.current)) {
      console.log(`Fetch skipped: isLoading=${isLoadingRef.current}, pageToFetch=${pageToFetch}, hasMore=${hasMoreRef.current}`);
      return;
    }
    console.log(`Fetching page: ${pageToFetch}`);
    setIsLoadingState(true);
    try {
      const response = await axios.get(`http://localhost:6868/api/employees`, {
        params: {
          page: pageToFetch,
          size: PAGE_SIZE
        }
      });
      const data = response.data;
      console.log("API Response data:", data);

      if (data.content && data.content.length > 0) {
        const newItemsCount = data.content.length;
        setTotalItemsFetchedSoFar(prevTotal => prevTotal + newItemsCount);

        setEmployees(prevEmployees => {
          // No MAX_RECORDS_IN_MEMORY check, just append or set
          const newCombinedEmployees = pageToFetch === 0 ? data.content : [...prevEmployees, ...data.content];
          return newCombinedEmployees;
        });
        setHasMoreState(!data.last);
        setCurrentPage(pageToFetch + 1);
        console.log(`Fetch success for page ${pageToFetch}. Total fetched in this batch: ${newItemsCount}. HasMore: ${!data.last}`);

      } else {
        setHasMoreState(false);
        if (pageToFetch === 0) {
            setEmployees([]);
            setTotalItemsFetchedSoFar(0);
        }
        console.log(`No content for page ${pageToFetch}. HasMore set to false.`);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.response?.data || error.message);
      }
      setHasMoreState(false);
    } finally {
      setIsLoadingState(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array makes fetchEmployeesAPI stable

  useEffect(() => {
    console.log("Initial effect: Resetting and fetching page 0");
    setEmployees([]);
    setCurrentPage(0);
    setHasMoreState(true);
    setIsLoadingState(false);
    setTotalItemsFetchedSoFar(0);
    fetchEmployeesAPI(0);
  }, [fetchEmployeesAPI]);

  const loadMoreEmployees = () => {
    if (!isLoadingRef.current && hasMoreRef.current) {
      console.log(`loadMoreEmployees called for page: ${currentPage}. Total fetched so far: ${totalItemsFetchedSoFar}`);
      fetchEmployeesAPI(currentPage);
    } else {
      console.log(`loadMoreEmployees skipped: isLoading=${isLoadingRef.current}, hasMore=${hasMoreRef.current}`);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="employee-list-container">
        <h1>Employee Directory</h1>
        <InfiniteScroll
          dataLength={totalItemsFetchedSoFar} // Use totalItemsFetchedSoFar HERE
          next={loadMoreEmployees}
          hasMore={hasMoreState}
          loader={<div className="loader"><h4>Loading more employees...</h4></div>}
          endMessage={
            !hasMoreState && employees.length > 0 && (
                 <p style={{ textAlign: 'center' }} className="end-message">
                    <b>You've reached the end of the list!</b>
                 </p>
            )
          }
        >
          {employees.map(employee => (
            <div key={employee.id} className="employee-card-div">
              <table className="employee-details-table">
                <tbody>
                  <tr>
                    <th>ID:</th>
                    <td>{employee.id}</td>
                  </tr>
                  <tr>
                    <th>First Name:</th>
                    <td>{employee.firstName}</td>
                  </tr>
                  <tr>
                    <th>Last Name:</th>
                    <td>{employee.lastName}</td>
                  </tr>
                  <tr>
                    <th>Birth Date:</th>
                    <td>{employee.birthDate ? new Date(employee.birthDate).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </InfiniteScroll>
        
        {!isLoadingState && employees.length === 0 && (
          <p className="no-employees">
            {hasMoreState ? "Fetching initial data..." : "No employees found."}
          </p>
        )}
        {isLoadingState && employees.length === 0 && hasMoreState && ( 
            <div className="loader"><h4>Loading initial employees...</h4></div>
        )}
      </div>
    </>
  );
}

export default EmployeeList;
