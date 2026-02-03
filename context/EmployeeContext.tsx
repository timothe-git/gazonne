import { Employee } from "@/types/types";
import { collection, getFirestore, onSnapshot, query } from '@react-native-firebase/firestore';
import { createContext, PropsWithChildren, useEffect, useState } from "react";

type EmployeeContextState = {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
};

export const employeeContext = createContext<EmployeeContextState>({
  employees: [],
  isLoading: false,
  error: null,
});

export function EmployeeProvider({ children }: PropsWithChildren) {
  const db = getFirestore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, 'employees'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const employeesFromDB: Employee[] = [];
        querySnapshot.forEach((doc: any) => {
          employeesFromDB.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setEmployees(employeesFromDB);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError('Error loading employees');
      setIsLoading(false);
    }
  }, []);

  return (
    <employeeContext.Provider value={{ employees, isLoading, error }}>
      {children}
    </employeeContext.Provider>
  );
}
