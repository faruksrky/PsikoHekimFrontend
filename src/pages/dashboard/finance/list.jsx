import { Helmet } from 'react-helmet-async';

import { FinanceView } from 'src/sections/finance/view';

// ----------------------------------------------------------------------

export default function FinancePage() {
    return (
        <>
            <Helmet>
                <title> Dashboard: Finans Yönetimi</title>
            </Helmet>

            <FinanceView />
        </>
    );
}
