// src/features/hoy/components/common/hoy-aprobar-panel.jsx
import { ApprovalPanel } from '@/features/common/components/approval-panel';

export const HoyAprobarPanel = ({ toApproveCount, currentUser, isMobile = false }) => {
    return <ApprovalPanel toApproveCount={toApproveCount} currentUser={currentUser} targetPath="/aprobar" isMobile={isMobile} />;
};
