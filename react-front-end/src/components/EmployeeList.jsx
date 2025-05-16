import { useState, useEffect, useCallback, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios';
import SearchBar from './SearchBar'; // Import SearchBar
import EmployeeCard from './EmployeeCard'; // Import EmployeeCard

const PAGE_SIZE = 10;

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
        bio: numericEmployeeId % 3 === 0 ? longBio : shortBio
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
            ...getMockExtraData(emp.id)
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
        bio: editFormData.bio
    };
    try {
      const response = await axios.patch(`http://localhost:6868/api/employees/${employeeId}`, payload);
      const updatedEmployeeFromServer = response.data;
      const fullUpdatedEmployee = {
          ...updatedEmployeeFromServer,
          ...getMockExtraData(updatedEmployeeFromServer.id), 
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
      <div className="employee-list-container">
        <h1>Employee Directory</h1>

        <SearchBar 
            searchTerm={searchTerm}
            onSearchInputChange={handleSearchInputChange}
            onExecuteSearch={executeSearch}
            onClearSearch={handleClearSearch}
        />

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
          {employees.map(employee => (
            <EmployeeCard 
                key={employee.id}
                employee={employee}
                isEditing={editingEmployeeId === employee.id}
                editFormData={editingEmployeeId === employee.id ? editFormData : {}}
                onInputChange={handleInputChange}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancelEdit={handleCancelEdit}
            />
          ))}
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
  );
}

export default EmployeeList;