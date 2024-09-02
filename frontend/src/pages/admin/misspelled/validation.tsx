import React, { useEffect } from 'react';
import { get } from '../../../utils/fetch';

const ValidationPage: React.FC = () => {

  const [validationData, setValidationData] = React.useState({});

  useEffect(() => {
    // fetch
    const fetchValidation = async () => {
      const { success, data } = await get("/api/admin/validation/queryByTestId");
      if (success) {
        setValidationData(data);
      }
    }
    fetchValidation();
  }, []);

  return (
    <div className="container mt-3 mx-auto px-3 h-full flex flex-col">
      <h1 className="text-3xl font-black flex items-center justify-between">
        Validation Detail
      </h1>
    </div>
  );
};

export default ValidationPage;