import React, { useState, useEffect, useCallback, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios';

const PAGE_SIZE = 10;

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

.search-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.search-container input[type="text"] {
  flex-grow: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95em;
}

.search-container button {
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95em;
  border: 1px solid transparent;
  transition: background-color 0.2s;
}

.search-button {
  background-color: #3b82f6; /* blue-500 */
  color: white;
}
.search-button:hover {
  background-color: #2563eb; /* blue-600 */
}

.clear-button {
  background-color: #6b7280; /* gray-500 */
  color: white;
}
.clear-button:hover {
  background-color: #4b5563; /* gray-600 */
}


.employee-card-div {
  border: 1px solid #d1d5db; 
  border-radius: 8px; 
  padding: 16px; 
  margin-bottom: 20px;
  background-color: #ffffff; 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); 
  transition: box-shadow 0.2s ease-in-out;
}

.employee-card-div:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); 
}

.employee-details-table {
  width: 100%;
  border-collapse: collapse; 
  margin-bottom: 10px;
}

.employee-details-table th,
.employee-details-table td {
  padding: 8px 12px; 
  text-align: left;
  font-size: 0.9em; 
  border-bottom: 1px solid #e5e7eb; 
  vertical-align: top; /* Align content to the top for bio field */
}

.employee-details-table th {
  font-weight: 600; 
  color: #4b5563; 
  width: 30%;
}

.employee-details-table td {
  color: #1f2937; 
}

.employee-details-table input[type="text"],
.employee-details-table input[type="date"],
.employee-details-table input[type="email"],
.employee-details-table input[type="tel"],
.employee-details-table textarea {
  width: calc(100% - 16px); /* Adjust for padding */
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1em; /* Match td font-size */
  box-sizing: border-box;
  font-family: inherit; /* Inherit font from parent */
}

.employee-details-table textarea {
  min-height: 80px; /* Minimum height for textarea */
  resize: vertical; /* Allow vertical resizing */
}

.bio-display {
  max-height: 100px; /* Max height before scrolling in view mode */
  overflow-y: auto;   /* Enable vertical scroll if content exceeds max-height */
  white-space: pre-wrap; /* Preserve line breaks and wrap text */
  word-break: break-word; /* Break long words to prevent overflow */
  border: 1px solid #e5e7eb; /* Optional: border to indicate scrollable area */
  padding: 6px;
  border-radius: 4px;
  background-color: #f9fafb; /* Slightly different background */
}


.employee-details-table tr:last-child th,
.employee-details-table tr:last-child td {
  border-bottom: none;
}

.action-buttons {
  margin-top: 12px;
  display: flex;
  gap: 10px; /* Space between buttons */
}

.action-buttons button {
  border: 1px solid transparent;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85em;
  transition: background-color 0.2s, border-color 0.2s;
}

.edit-button {
  background-color: #3b82f6; /* Tailwind blue-500 */
  color: white;
}
.edit-button:hover {
  background-color: #2563eb; /* Tailwind blue-600 */
}

.save-button {
  background-color: #10b981; /* Tailwind green-500 */
  color: white;
}
.save-button:hover {
  background-color: #059669; /* Tailwind green-600 */
}

.cancel-button {
  background-color: #ef4444; /* Tailwind red-500 */
  color: white;
}
.cancel-button:hover {
  background-color: #dc2626; /* Tailwind red-600 */
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

// Helper function to generate some mock data for new fields
const getMockExtraData = (employeeId) => {
    const departments = ["Engineering", "Marketing", "Sales", "Human Resources", "Finance"];
    const baseYear = 2015;
    const numericEmployeeId = Number(employeeId) || 0; 
    
    const shortBio = `Employee #${numericEmployeeId} has been a valuable member of the ${departments[numericEmployeeId % departments.length]} department since their hire. Known for dedication and a collaborative spirit.`;
    const longBio = `Employee #${numericEmployeeId} joined our team on ${baseYear + (numericEmployeeId % 8)}-${String((numericEmployeeId % 12) + 1).padStart(2, '0')}-${String((numericEmployeeId % 28) + 1).padStart(2, '0')} and has since become an integral part of the ${departments[numericEmployeeId % departments.length]} department. 
    
Throughout their tenure, Employee #${numericEmployeeId} has consistently demonstrated exceptional skills in project management and cross-functional team leadership. They have been instrumental in several key initiatives, contributing significantly to their success. 
    
Colleagues describe Employee #${numericEmployeeId} as a proactive problem-solver, always willing to lend a hand and share their expertise. Their positive attitude and commitment to excellence make them a role model within the team. Outside of work, Employee #${numericEmployeeId} enjoys hiking, photography, and volunteering in the local community, reflecting their well-rounded and engaged personality. This bio is intentionally made longer to test the scrollable text field functionality and ensure that the UI handles larger amounts of text gracefully. We are adding more sentences here to make sure it overflows.`;

    return {
        department: departments[numericEmployeeId % departments.length],
        email: `employee${numericEmployeeId}@example.com`,
        phoneNumber: `555-01${String(numericEmployeeId % 100).padStart(2, '0')}`,
        hireDate: `${baseYear + (numericEmployeeId % 8)}-${String((numericEmployeeId % 12) + 1).padStart(2, '0')}-${String((numericEmployeeId % 28) + 1).padStart(2, '0')}`,
        bio: numericEmployeeId % 3 === 0 ? longBio : shortBio // Some employees get a longer bio
    };
};


function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [hasMoreState, setHasMoreState] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItemsFetchedSoFar, setTotalItemsFetchedSoFar] = useState(0);

  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [searchTerm, setSearchTerm] = useState(''); 
  const [activeSearchId, setActiveSearchId] = useState(''); 

  const isLoadingRef = useRef(isLoadingState);
  const hasMoreRef = useRef(hasMoreState);

  useEffect(() => {
    isLoadingRef.current = isLoadingState;
  }, [isLoadingState]);

  useEffect(() => {
    hasMoreRef.current = hasMoreState;
  }, [hasMoreState]);

  const fetchEmployeesAPI = useCallback(async (pageToFetch, searchIdToFetch = '') => {
    if (isLoadingRef.current || (pageToFetch > 0 && !hasMoreRef.current)) {
      console.log(`Fetch skipped: isLoading=${isLoadingRef.current}, pageToFetch=${pageToFetch}, hasMore=${hasMoreRef.current}, searchId: ${searchIdToFetch}`);
      return;
    }
    console.log(`Fetching page: ${pageToFetch}, searchId: ${searchIdToFetch}`);
    setIsLoadingState(true);
    
    const params = { page: pageToFetch, size: PAGE_SIZE };
    if (searchIdToFetch && searchIdToFetch.trim() !== '') {
      params.id = searchIdToFetch.trim();
    }

    try {
      const response = await axios.get(`http://localhost:6868/api/employees`, { params });
      const data = response.data;
      console.log("API Response data:", data);

      if (data.content && data.content.length > 0) {
        const newItemsCount = data.content.length;
        setTotalItemsFetchedSoFar(prevTotal => (pageToFetch === 0 ? newItemsCount : prevTotal + newItemsCount));
        
        const augmentedContent = data.content.map(emp => ({
            ...emp,
            ...getMockExtraData(emp.id) // Add mock data including bio
        }));
        setEmployees(prevEmployees => 
            pageToFetch === 0 ? augmentedContent : [...prevEmployees, ...augmentedContent]
        );
        setHasMoreState(!data.last);
        setCurrentPage(pageToFetch + 1);
      } else {
        setHasMoreState(false);
        if (pageToFetch === 0) {
            setEmployees([]);
            setTotalItemsFetchedSoFar(0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setHasMoreState(false);
      if (pageToFetch === 0) {
          setEmployees([]);
          setTotalItemsFetchedSoFar(0);
      }
    } finally {
      setIsLoadingState(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    console.log(`Effect for initial load or search change. ActiveSearchId: '${activeSearchId}'`);
    setEmployees([]);
    setCurrentPage(0);
    setHasMoreState(true);
    setIsLoadingState(false);
    setTotalItemsFetchedSoFar(0);
    fetchEmployeesAPI(0, activeSearchId);
  }, [fetchEmployeesAPI, activeSearchId]);

  const loadMoreEmployees = () => {
    if (!isLoadingRef.current && hasMoreRef.current) {
      fetchEmployeesAPI(currentPage, activeSearchId);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployeeId(employee.id);
    setEditFormData({ ...employee }); 
  };

  const handleCancelEdit = () => {
    setEditingEmployeeId(null);
    setEditFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSave = async (employeeId) => {
    const payload = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        birthDate: editFormData.birthDate,
        department: editFormData.department,
        email: editFormData.email,
        phoneNumber: editFormData.phoneNumber,
        hireDate: editFormData.hireDate,
        bio: editFormData.bio // Include bio in payload
    };
    try {
      const response = await axios.patch(`http://localhost:6868/api/employees/${employeeId}`, payload);
      // Augment the response data with mock data as well if the backend doesn't return it
      const updatedEmployeeFromServer = response.data;
      const fullUpdatedEmployee = {
          ...updatedEmployeeFromServer,
          // Re-apply mock data for fields not returned by PATCH, or ensure PATCH returns all
          ...getMockExtraData(updatedEmployeeFromServer.id), 
          // Explicitly use the bio from the form as it was just saved
          bio: payload.bio 
      };

      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp.id === employeeId ? fullUpdatedEmployee : emp
        )
      );
      setEditingEmployeeId(null);
      setEditFormData({});
    } catch (error) {
      console.error("Failed to update employee:", error.response?.data || error.message);
      alert(`Error saving employee: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const executeSearch = () => {
    if (searchTerm.trim() !== activeSearchId || searchTerm.trim() === '') {
        setActiveSearchId(searchTerm.trim());
    } else if (searchTerm.trim() === activeSearchId && searchTerm.trim() !== '') {
        setEmployees([]);
        setCurrentPage(0);
        setHasMoreState(true);
        setIsLoadingState(false);
        setTotalItemsFetchedSoFar(0);
        fetchEmployeesAPI(0, activeSearchId);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (activeSearchId !== '') {
        setActiveSearchId('');
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="employee-list-container">
        <h1>Employee Directory</h1>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Employee ID..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
          />
          <button onClick={executeSearch} className="search-button">Search</button>
          <button onClick={handleClearSearch} className="clear-button">Clear</button>
        </div>

        <InfiniteScroll
          dataLength={totalItemsFetchedSoFar}
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
          key={activeSearchId || 'all-employees'} 
        >
          {employees.map(employee => {
            const isEditing = editingEmployeeId === employee.id;
            const displayData = isEditing ? editFormData : employee;
            return (
              <div key={employee.id} className="employee-card-div">
                <table className="employee-details-table">
                  <tbody>
                    <tr><th>ID:</th><td>{displayData.id}</td></tr>
                    <tr><th>First Name:</th><td>{isEditing ? <input type="text" name="firstName" value={displayData.firstName || ''} onChange={handleInputChange} /> : displayData.firstName}</td></tr>
                    <tr><th>Last Name:</th><td>{isEditing ? <input type="text" name="lastName" value={displayData.lastName || ''} onChange={handleInputChange} /> : displayData.lastName}</td></tr>
                    <tr><th>Birth Date:</th><td>{isEditing ? <input type="date" name="birthDate" value={displayData.birthDate || ''} onChange={handleInputChange} /> : (displayData.birthDate ? new Date(displayData.birthDate).toLocaleDateString() : 'N/A')}</td></tr>
                    <tr><th>Department:</th><td>{isEditing ? <input type="text" name="department" value={displayData.department || ''} onChange={handleInputChange} /> : displayData.department}</td></tr>
                    <tr><th>Email:</th><td>{isEditing ? <input type="email" name="email" value={displayData.email || ''} onChange={handleInputChange} /> : displayData.email}</td></tr>
                    <tr><th>Phone:</th><td>{isEditing ? <input type="tel" name="phoneNumber" value={displayData.phoneNumber || ''} onChange={handleInputChange} /> : displayData.phoneNumber}</td></tr>
                    <tr><th>Hire Date:</th><td>{isEditing ? <input type="date" name="hireDate" value={displayData.hireDate || ''} onChange={handleInputChange} /> : (displayData.hireDate ? new Date(displayData.hireDate).toLocaleDateString() : 'N/A')}</td></tr>
                    <tr>
                      <th>Bio:</th>
                      <td>
                        {isEditing ? (
                          <textarea name="bio" value={displayData.bio || ''} onChange={handleInputChange} />
                        ) : (
                          <div className="bio-display">{displayData.bio || 'N/A'}</div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="action-buttons">
                  {isEditing ? (
                    <><button onClick={() => handleSave(employee.id)} className="save-button">Save</button><button onClick={handleCancelEdit} className="cancel-button">Cancel</button></>
                  ) : (
                    <button onClick={() => handleEdit(employee)} className="edit-button">Edit</button>
                  )}
                </div>
              </div>
            );
          })}
        </InfiniteScroll>
        
        {!isLoadingState && employees.length === 0 && (
          <p className="no-employees">
            {hasMoreState ? (activeSearchId ? "Searching..." : "Fetching initial data...") : (activeSearchId ? `No employee found with ID: ${activeSearchId}` : "No employees found.")}
          </p>
        )}
        {isLoadingState && employees.length === 0 && hasMoreState && ( 
            <div className="loader"><h4>{activeSearchId ? `Searching for ID: ${activeSearchId}...` : "Loading initial employees..."}</h4></div>
        )}
      </div>
    </>
  );
}

export default EmployeeList;
