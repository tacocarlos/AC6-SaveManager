import { openFileInExplorer, openInExplorer } from '@src/util';
import * as tauriPath from '@tauri-apps/api/path';
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@ui/breadcrumb';
import { Ellipsis, Slash } from 'lucide-react';

function getRelevantFileParts(
    path: string,
    startCount: number,
    endCount: number
) {
    const totalCount = startCount + endCount;
    const pathParts = path.split(tauriPath.sep);
    if (pathParts.length <= totalCount) {
        return pathParts;
    }

    const relevantParts = [];
    for (let i = 0; i < startCount; i++) {
        relevantParts.push(pathParts[i]);
    }
    for (let j = pathParts.length - endCount; j < pathParts.length; j++) {
        relevantParts.push(pathParts[j]);
    }
    return relevantParts;
}

function Separator() {
    return (
        <BreadcrumbSeparator>
            <Slash />
        </BreadcrumbSeparator>
    );
}

function BCEllipsis() {
    return (
        <BreadcrumbSeparator>
            <Ellipsis />
        </BreadcrumbSeparator>
    );
}

export default function PathView({
    filePath,
    isFile,
    startCount,
    endCount,
}: {
    filePath: string;
    isFile: boolean;
    startCount?: number | undefined;
    endCount?: number | undefined;
}) {
    startCount = startCount ?? 3;
    endCount = endCount ?? 2;
    const fileParts = getRelevantFileParts(filePath, startCount, endCount);

    const prefixItems = fileParts
        .slice(0, startCount)
        .map((item) => <PathViewItem pathItem={item} />);

    const postfixItems = fileParts
        .slice(startCount)
        .map((item, idx, parts) => (
            <PathViewItem pathItem={item} isLast={idx === parts.length - 1} />
        ));

    function openFile() {
        if (isFile) {
            openFileInExplorer(filePath);
        } else {
            openInExplorer(filePath);
        }
    }

    return (
        <Breadcrumb
            onClick={openFile}
            className="hover:bg-actualgray flex list-none items-center rounded-xl border px-3 font-semibold">
            <BreadcrumbList className="text-white">
                {prefixItems}
                <BCEllipsis />
                <Separator />
                {postfixItems}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export function PathViewItem({
    pathItem,
    isLast = false,
}: {
    pathItem: string;
    isLast?: boolean;
}) {
    return (
        <>
            <BreadcrumbItem>
                <span>{pathItem}</span>
            </BreadcrumbItem>
            {!isLast ? <Separator /> : null}
        </>
    );
}
