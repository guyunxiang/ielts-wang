import { useEffect, useState } from "react";

import { get } from '../../utils/fetch';
import { Link } from "react-router-dom";



const AdminPage = () => {

  return (
    <div className="container mx-auto mt-3">
      <h1 className="text-3xl font-black">Admin page</h1>
      <hr className="my-3" />
      <ul className="flex gap-3">
        <li className="px-3 py-2 border border-dashed border-primary text-primary">
          <Link to="/admin/vocabulary">
            Vocabulary Management
          </Link>
        </li>
        <li className="px-3 py-2 border border-dashed border-primary text-primary">
          <Link to="/admin/whitelist">
            White List Management
          </Link>
        </li>
        <li className="px-3 py-2 border border-dashed border-primary text-primary">
          <Link to="/admin/misspelled">
            Misspelled Table Management
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default AdminPage;