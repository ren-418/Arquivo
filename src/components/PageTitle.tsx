import React from 'react';
import { cn } from '@/utils/utils';
import { motion } from 'framer-motion';

interface PageTitleProps {
    title: string;
    description?: string;
    className?: string;
    rightContent?: React.ReactNode;
}

const PageTitle: React.FC<PageTitleProps> = ({
    title,
    description,
    className,
    rightContent,
}) => {
    return (
        <div className={cn("mb-8 flex items-center justify-between", className)}>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="text-muted-foreground mt-1"
                    >
                        {description}
                    </motion.p>
                )}
            </motion.div>

            {rightContent && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                >
                    {rightContent}
                </motion.div>
            )}
        </div>
    );
};

export default PageTitle;