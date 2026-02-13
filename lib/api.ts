const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchEmployees() {
    const res = await fetch(`${API_URL}/employees`);
    if (!res.ok) throw new Error('Failed to fetch employees');
    const json = await res.json();
    return json.data;
}

export async function createEmployee(employeeData: any) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData),
    });
    if (!res.ok) throw new Error('Failed to create employee');
    const json = await res.json();
    return json.data;
}

export async function deleteEmployee(id: string) {
    const res = await fetch(`${API_URL}/employees/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete employee');
    return true;
}

export async function updateEmployee(id: string, updates: any) {
    const res = await fetch(`${API_URL}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update employee');
    const json = await res.json();
    return json.data;
}
