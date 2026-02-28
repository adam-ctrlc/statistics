import { forwardRef } from "react";
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ArrowUpTrayIcon,
  ArrowsUpDownIcon,
  Bars3Icon,
  BookOpenIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
  GlobeAltIcon,
  HashtagIcon,
  InformationCircleIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PencilSquareIcon,
  PlusIcon,
  ShareIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  TableCellsIcon,
  TrashIcon,
  TrophyIcon,
  UserCircleIcon,
  UserIcon,
  UserMinusIcon,
  UsersIcon,
  ViewColumnsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function withLucideLikeProps(Icon) {
  return forwardRef(function IconAdapter(
    { size, strokeWidth, className, style, ...props },
    ref
  ) {
    const mergedStyle = {
      ...(style || {}),
      ...(size ? { width: size, height: size } : {}),
    };

    return (
      <Icon
        ref={ref}
        className={className}
        style={mergedStyle}
        aria-hidden={props["aria-label"] ? undefined : true}
        {...props}
      />
    );
  });
}

export const AlertCircle = withLucideLikeProps(ExclamationCircleIcon);
export const AlertTriangle = withLucideLikeProps(ExclamationTriangleIcon);
export const ArrowRight = withLucideLikeProps(ArrowRightIcon);
export const ArrowUpDown = withLucideLikeProps(ArrowsUpDownIcon);
export const Award = withLucideLikeProps(TrophyIcon);
export const BarChart = withLucideLikeProps(ChartBarIcon);
export const BarChart3 = withLucideLikeProps(ChartBarIcon);
export const BarChartHorizontal = withLucideLikeProps(ChartBarIcon);
export const BookCopy = withLucideLikeProps(BookOpenIcon);
export const Briefcase = withLucideLikeProps(BriefcaseIcon);
export const Building = withLucideLikeProps(BuildingOffice2Icon);
export const Calendar = withLucideLikeProps(CalendarIcon);
export const CalendarDays = withLucideLikeProps(CalendarDaysIcon);
export const CheckCircle = withLucideLikeProps(CheckCircleIcon);
export const ChevronLeft = withLucideLikeProps(ChevronLeftIcon);
export const ChevronRight = withLucideLikeProps(ChevronRightIcon);
export const ChevronsLeft = withLucideLikeProps(ChevronDoubleLeftIcon);
export const ChevronsRight = withLucideLikeProps(ChevronDoubleRightIcon);
export const Columns = withLucideLikeProps(ViewColumnsIcon);
export const Database = withLucideLikeProps(CircleStackIcon);
export const Download = withLucideLikeProps(ArrowDownTrayIcon);
export const Edit = withLucideLikeProps(PencilSquareIcon);
export const Eye = withLucideLikeProps(EyeIcon);
export const EyeOff = withLucideLikeProps(EyeSlashIcon);
export const FileSpreadsheet = withLucideLikeProps(DocumentChartBarIcon);
export const FileText = withLucideLikeProps(DocumentTextIcon);
export const Filter = withLucideLikeProps(FunnelIcon);
export const Globe = withLucideLikeProps(GlobeAltIcon);
export const GraduationCap = withLucideLikeProps(AcademicCapIcon);
export const Hash = withLucideLikeProps(HashtagIcon);
export const Info = withLucideLikeProps(InformationCircleIcon);
export const KeyRound = withLucideLikeProps(KeyIcon);
export const LayoutDashboard = withLucideLikeProps(Squares2X2Icon);
export const LoaderCircle = withLucideLikeProps(ArrowPathIcon);
export const LogOut = withLucideLikeProps(ArrowLeftStartOnRectangleIcon);
export const Menu = withLucideLikeProps(Bars3Icon);
export const Minus = withLucideLikeProps(MinusIcon);
export const MoreHorizontal = withLucideLikeProps(EllipsisHorizontalIcon);
export const Network = withLucideLikeProps(ShareIcon);
export const Percent = withLucideLikeProps(ChartBarIcon);
export const Plus = withLucideLikeProps(PlusIcon);
export const RefreshCcw = withLucideLikeProps(ArrowPathIcon);
export const RefreshCw = withLucideLikeProps(ArrowPathIcon);
export const Repeat = withLucideLikeProps(ArrowPathIcon);
export const Save = withLucideLikeProps(CheckIcon);
export const School = withLucideLikeProps(AcademicCapIcon);
export const Search = withLucideLikeProps(MagnifyingGlassIcon);
export const ShieldCheck = withLucideLikeProps(ShieldCheckIcon);
export const Table = withLucideLikeProps(TableCellsIcon);
export const Table2 = withLucideLikeProps(TableCellsIcon);
export const Trash2 = withLucideLikeProps(TrashIcon);
export const TrendingDown = withLucideLikeProps(ArrowTrendingDownIcon);
export const TrendingUp = withLucideLikeProps(ArrowTrendingUpIcon);
export const Upload = withLucideLikeProps(ArrowUpTrayIcon);
export const User = withLucideLikeProps(UserIcon);
export const UserCheck = withLucideLikeProps(UserCircleIcon);
export const UserCircle = withLucideLikeProps(UserCircleIcon);
export const UserCog = withLucideLikeProps(Cog6ToothIcon);
export const UserX = withLucideLikeProps(UserMinusIcon);
export const Users = withLucideLikeProps(UsersIcon);
export const Users2 = withLucideLikeProps(UsersIcon);
export const X = withLucideLikeProps(XMarkIcon);
