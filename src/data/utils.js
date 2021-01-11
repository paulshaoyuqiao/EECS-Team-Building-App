const courses = ["CS 61A", "CS 61B", "CS 61C", "CS 70", "CS 160", "CS 161", "CS 162", "CS 164", "CS 169A", "CS 170", "CS 186", "CS 188", "CS 189"];
const clientBaseUrl = "localhost:8887";

const getFormPath = (formName, formCourse, formUrl="", withoutBase=false) => {
    formName = formName.toLowerCase();
    formCourse = formCourse.toLowerCase().split(" ")[1];
    formUrl = formUrl.trim();
    const formPath = formUrl.length === 0 ? `${formCourse}/${formName.replaceAll(" ", "-")}` : `${formCourse}/${formUrl}`;
    return withoutBase ? `/${formPath}` : `${clientBaseUrl}/${formPath}`;
}


export { courses, clientBaseUrl, getFormPath };