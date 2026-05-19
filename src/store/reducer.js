export const initialState = {
	atoken: null,
	rtoken: null,
	customerid: null,
	managerId: null,
customersuffix: null,
	usertimezone: null,
	userdialingcode: null,
	eventId: 0,
	eventType: null,
	eventCode: null,
	userDetail: [],
	roleClaims: [],
	menuList: [],
	eventApproverList: [],
	Notificationlist: [],
	NotificationlistRaiseQuery: [],
	CommId: 0,
	opendrawer:false,
	logincount: 0,
	bidtype: null,
	messageCount: 0, 
	isNotificationOpen: false,
	latestCommId: null,
	dashboardFilter: 'Last 7 days',
	messageSource: null,

};

export const actionTypes = {
	SET_ATOKEN: "SET_ATOKEN",
	SET_RTOKEN: "SET_RTOKEN",
	SET_CUSTOMERID: "SET_CUSTOMERID",
	SET_MANAGERID: "SET_MANAGERID",
	SET_MSGALERT: "SET_MSGALERT",
	SET_MSGALERTDATA: "SET_MSGALERTDATA",
	SET_MSGALERTTYPE: "SET_MSGALERTTYPE",
	SET_CUSTOMERSUFFIX: "SET_CUSTOMERSUFFIX",
	SET_USERTIMEZONE: "SET_USERTIMEZONE",
	SET_USERDIALINGCODE: "SET_DIALINGCODE",
	SET_USERDETAIL: "SET_USERDETAIL",
	SET_EVENTID: "SET_EVENTID",
	SET_EVENTTYPE: "SET_EVENTTYPE",
	SET_EVENTCODE: "SET_EVENTCODE",
	SET_RoleClaims: "SET_RoleClaims",
	SET_MenuList: "SET_MenuList",
	SET_EVENTAPPROVERLIST: "SET_EVENTAPPROVERLIST",
	SET_Notificationlist: "SET_Notificationlist",
	SET_NotificationlistRaiseQuery: "SET_NotificationlistRaiseQuery",
	SET_CommId: "SET_CommId",
	SET_LOGINCOUNT: "SET_LOGINCOUNT",
	SET_Bidtype: "SET_Bidtype",
	SET_Opendrawer: "SET_Opendrawer",
	SET_MESSAGE_COUNT: "SET_MESSAGE_COUNT",
	SET_NotificationDrawer: "SET_NotificationDrawer", 
	SET_LATEST_COMMID: "SET_LATEST_COMMID",
	SET_DASHBOARD_FILTER: "SET_DASHBOARD_FILTER",
	SET_MessageSource: "SET_MessageSource",




};

const reducer = (state, action) => {
	switch (action.type) {
		case actionTypes.SET_ATOKEN:
			return { ...state, atoken: action.value };
		case actionTypes.SET_RTOKEN:
			return { ...state, rtoken: action.value };
		case actionTypes.SET_CUSTOMERID:
			return { ...state, customerid: action.value };
		case actionTypes.SET_MANAGERID:
			return { ...state, managerId: action.value };
		case actionTypes.SET_MSGALERT:
			return { ...state, msgalert: action.value };
		case actionTypes.SET_MSGALERTDATA:
			return { ...state, msgalertMessage: action.value };
		case actionTypes.SET_MSGALERTTYPE:
			return { ...state, msgalertType: action.value };
		case actionTypes.SET_CUSTOMERSUFFIX:
			return { ...state, customersuffix: action.value };
		case actionTypes.SET_USERTIMEZONE:
			return { ...state, usertimezone: action.value };
		case actionTypes.SET_USERDIALINGCODE:
			return { ...state, userdialingcode: action.value };
		case actionTypes.SET_USERDETAIL:
			return { ...state, userDetail: action.value };
		case actionTypes.SET_LEGALID:
			return { ...state, eventId: action.value };
		case actionTypes.SET_EVENTID:
			return { ...state, eventId: action.value };
		case actionTypes.SET_EVENTTYPE:
			return { ...state, eventType: action.value };
			case actionTypes.SET_EVENTCODE:
			return { ...state, eventCode: action.value };
		case actionTypes.SET_RoleClaims:
			return { ...state, roleClaims: action.value };
		case actionTypes.SET_MenuList:
			return { ...state, menuList: action.value };
		case actionTypes.SET_EVENTAPPROVERLIST:
			return { ...state, eventApproverList: action.value };
		case actionTypes.SET_Notificationlist:
			return { ...state, Notificationlist: action.value };
			case actionTypes.SET_NotificationlistRaiseQuery:
			return { ...state, NotificationlistRaiseQuery: action.value };
		case actionTypes.SET_CommId:
			return { ...state, CommId: action.value };
		case actionTypes.SET_Bidtype:
			return { ...state, bidtype: action.value };
		default:
			return state;
		case actionTypes.SET_LOGINCOUNT:
			return { ...state, logincount: action.value };
		case actionTypes.SET_Opendrawer:
			return { ...state, opendrawer: action.value };
			case actionTypes.SET_MESSAGE_COUNT:
				return { ...state, messageCount: action.value };
				case actionTypes.SET_NotificationDrawer:
	return { ...state, isNotificationOpen: action.value };
		case actionTypes.SET_LATEST_COMMID:
			return { ...state, latestCommId: action.value };
		case actionTypes.SET_DASHBOARD_FILTER:
			return { ...state, dashboardFilter: action.value };
		case actionTypes.SET_MessageSource:
			return { ...state, messageSource: action.value };

	}
};

export default reducer;
