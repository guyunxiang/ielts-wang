import { Link } from "react-router-dom";

const AdminPage = () => {

  return (
    <div className="container mx-auto mt-3">
      <h1 className="text-3xl font-black">Admin page</h1>
      <hr className="my-3" />
      <ul className="flex gap-3">
        <li className="border border-dashed border-primary text-primary hover:bg-secondary-200">
          <Link to="/admin/vocabulary" className="block px-3 py-2">
            Vocabulary Management
          </Link>
        </li>
        <li className="border border-dashed border-primary text-primary hover:bg-secondary-200">
          <Link to="/admin/whitelist" className="block px-3 py-2">
            White List Management
          </Link>
        </li>
        <li className="border border-dashed border-primary text-primary hover:bg-secondary-200">
          <Link to="/admin/misspelled" className="block px-3 py-2">
            Misspelled Table Management
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default AdminPage;