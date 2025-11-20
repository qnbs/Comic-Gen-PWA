import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { resetMetadataUpdateStatus } from '../../../features/gutenbergSlice';
import { LoaderIcon, CheckIcon, XCircleIcon } from '../../Icons';

const SaveStatusIndicator: React.FC = () => {
    const dispatch = useAppDispatch();
    const { metadataUpdateStatus } = useAppSelector((state) => state.libraryBrowser);

    useEffect(() => {
        if (metadataUpdateStatus === 'saved' || metadataUpdateStatus === 'error') {
            const timer = setTimeout(() => {
                dispatch(resetMetadataUpdateStatus());
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [metadataUpdateStatus, dispatch]);
    
    if (metadataUpdateStatus === 'idle') {
        return null;
    }

    const statusMap = {
        saving: { icon: <LoaderIcon className="w-4 h-4 animate-spin"/>, text: 'Saving...', color: 'text-gray-500 dark:text-gray-400' },
        saved: { icon: <CheckIcon className="w-4 h-4"/>, text: 'Saved', color: 'text-green-600 dark:text-green-400' },
        error: { icon: <XCircleIcon className="w-4 h-4"/>, text: 'Save Error', color: 'text-red-600 dark:text-red-400' },
    };

    const currentStatus = statusMap[metadataUpdateStatus];

    return (
        <div className={`flex items-center gap-1.5 text-xs font-medium pr-2 transition-opacity duration-300 ${currentStatus.color}`}>
            {currentStatus.icon}
            <span>{currentStatus.text}</span>
        </div>
    );
};

export default SaveStatusIndicator;
