
import { getWorkReports } from '@/app/actions';
import { WorkReportsList } from './_components/work-reports-list';

export default async function WorkReportsPage() {
    const reportsResult = await getWorkReports();
    const reports = reportsResult.success ? reportsResult.data || [] : [];
    
    return (
        <div className="space-y-8 py-8">
            <WorkReportsList reports={reports} />
        </div>
    );
}
