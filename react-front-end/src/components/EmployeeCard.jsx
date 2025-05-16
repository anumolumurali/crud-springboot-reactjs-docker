import React from 'react';

function EmployeeCard({ 
    employee, 
    isEditing, 
    editFormData, 
    onInputChange, 
    onEdit, 
    onSave, 
    onCancelEdit 
}) {
  const displayData = isEditing ? editFormData : employee;

  return (
    <div className="employee-card-div">
      <table className="employee-details-table">
        <tbody>
          <tr><th>ID:</th><td>{displayData.id}</td></tr>
          <tr>
            <th>First Name:</th>
            <td>
              {isEditing ? (
                <input type="text" name="firstName" value={displayData.firstName || ''} onChange={onInputChange} />
              ) : (
                displayData.firstName
              )}
            </td>
          </tr>
          <tr>
            <th>Last Name:</th>
            <td>
              {isEditing ? (
                <input type="text" name="lastName" value={displayData.lastName || ''} onChange={onInputChange} />
              ) : (
                displayData.lastName
              )}
            </td>
          </tr>
          <tr>
            <th>Birth Date:</th>
            <td>
              {isEditing ? (
                <input type="date" name="birthDate" value={displayData.birthDate || ''} onChange={onInputChange} />
              ) : (
                displayData.birthDate ? new Date(displayData.birthDate).toLocaleDateString() : 'N/A'
              )}
            </td>
          </tr>
          <tr>
            <th>Department:</th>
            <td>
              {isEditing ? (
                <input type="text" name="department" value={displayData.department || ''} onChange={onInputChange} />
              ) : (
                displayData.department
              )}
            </td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>
              {isEditing ? (
                <input type="email" name="email" value={displayData.email || ''} onChange={onInputChange} />
              ) : (
                displayData.email
              )}
            </td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>
              {isEditing ? (
                <input type="tel" name="phoneNumber" value={displayData.phoneNumber || ''} onChange={onInputChange} />
              ) : (
                displayData.phoneNumber
              )}
            </td>
          </tr>
          <tr>
            <th>Hire Date:</th>
            <td>
              {isEditing ? (
                <input type="date" name="hireDate" value={displayData.hireDate || ''} onChange={onInputChange} />
              ) : (
                displayData.hireDate ? new Date(displayData.hireDate).toLocaleDateString() : 'N/A'
              )}
            </td>
          </tr>
          <tr>
            <th>Bio:</th>
            <td>
              {isEditing ? (
                <textarea name="bio" value={displayData.bio || ''} onChange={onInputChange} />
              ) : (
                <div className="bio-display">{displayData.bio || 'N/A'}</div>
              )}
            </td>
          </tr>
        </tbody>
      </table>
      <div className="action-buttons">
        {isEditing ? (
          <>
            <button onClick={() => onSave(employee.id)} className="save-button">Save</button>
            <button onClick={onCancelEdit} className="cancel-button">Cancel</button>
          </>
        ) : (
          <button onClick={() => onEdit(employee)} className="edit-button">Edit</button>
        )}
      </div>
    </div>
  );
}

export default EmployeeCard;