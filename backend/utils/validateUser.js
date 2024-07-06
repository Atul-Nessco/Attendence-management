const validateUser = (rows, employeeId, password) => {
    for (const row of rows) {
      const [id, name, department, storedPassword] = row;
      console.log(`Checking user: ${id} with password: ${storedPassword}`);
      if (id === employeeId && password === storedPassword) {
        return { id, name, department, employeeId: id };
      }
    }
    return null;
  };
  
  module.exports = validateUser;
  