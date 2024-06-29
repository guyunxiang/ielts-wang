import { Link } from "react-router-dom";

import './index.css';

const UserCenter = () => {

    return (
        <div className='container mx-auto flex justify-center align-center gap-8 mt-8'>
            <table className="border-collapse border border-primary" id="accuracy-rate-table">
                <thead className="bg-[#fdba74]">
                    <tr>
                        <th rowSpan={2} className="border border-primary text-primary px-3">Test Paper</th>
                        <th rowSpan={2} className="border border-primary text-primary px-3">Vocabulary</th>
                        <th colSpan={3} className="border border-primary text-primary px-3">1</th>
                    </tr>
                    <tr>
                        <th className="border border-primary text-primary px-3">✓</th>
                        <th className="border border-primary text-primary px-3">Rate</th>
                        <th className="border border-primary text-primary px-3">Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-primary">Chapter 3</td>
                        <td className="border border-primary">1135</td>
                    </tr>
                </tbody>
            </table>
            <Link to="/training/667f2efd24cbf567ebe2dd88" state={{ id: "667f2efd24cbf567ebe2dd88"}}>
                Training
            </Link>
        </div>
    )
}

export default UserCenter;