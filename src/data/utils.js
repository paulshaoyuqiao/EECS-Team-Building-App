const courses = ["CS 61A", "CS 61B", "CS 61C", "CS 70", "CS 160", "CS 161", "CS 162", "CS 164", "CS 169A", "CS 170", "CS 186", "CS 188", "CS 189"];
const clientBaseUrl = "localhost:8887";

const getFormPath = (formName, formCourse, formUrl = "", withoutBase = false) => {
    formName = formName.toLowerCase();
    formCourse = formCourse.toLowerCase().split(" ")[1];
    formUrl = formUrl.trim();
    const formPath = formUrl.length === 0 ? `${formCourse}/${formName.replaceAll(" ", "-")}` : `${formCourse}/${formUrl}`;
    return withoutBase ? `/${formPath}` : `${clientBaseUrl}/${formPath}`;
}

const FormAccessType = Object.freeze({
    VIEW: "view",
    EDIT: "edit",
    VISUALIZE: "viz",
});

const QuestionType = Object.freeze({
    SHORT_ANSWER: "short-answer",
    SINGLE_SELECT: "single-select",
    MULTI_SELECT: "multi-select",
    GRID_RANK: "grid-rank",
});

const BarChartColors = ["deepPurple", "indigo", "blue", "lightBlue", "teal", "cyan"];

export { courses, clientBaseUrl, getFormPath, FormAccessType, QuestionType, BarChartColors };