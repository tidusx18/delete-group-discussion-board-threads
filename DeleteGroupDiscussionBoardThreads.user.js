// ==UserScript==
// @name         Bulk Delete Group Discussion Board Forum Threads
// @namespace    https://github.com/tidusx18
// @version      0.0.1
// @description  Deletes all threads from all group discussion boards/forums.
// @author       Daniel Victoriano <victoriano518@gmail.com>
// @match        https://fiu.blackboard.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

if (document.URL.includes("/webapps/bb-group-mgmt-LEARN/execute/groupInventoryList?")) {

	// Clear sessionStorage as a precaution for prematurely aborted script run
	sessionStorage.clear();

	// Create a new button and append to menu bar
	var newLi = document.createElement("li");
	newLi.setAttribute("id", "my-button2");
	newLi.setAttribute("class", "mainButton sub bcContent");

	var newLink = document.createElement("a");
	newLink.style.cursor = "pointer";
	newLink.innerHTML = "Delete All Forum Threads";

	newLi.appendChild(newLink);

	document.querySelector(".actionBar").appendChild(newLi);

	// Call deleteMenu() when button is clicked
	document.querySelector("#my-button2").addEventListener("click", function() {
		if (confirm("This will delete ALL Group Discussion Board Forum Threads...Proceed?")) {

			storeGroupIds();
		}
			});
}

// Check last run function
switch(sessionStorage.lastRun) {
	case "openDiscussionBoard":
		storeForumIds();
		break;

	case "openForum":
		deleteAllForumThreads();
		break;

	case "deleteAllForumThreads":
		openForum();
		break;

	case "done":
		// No action required - Waiting for user action
        break;

	default:
		// No action required - Waiting for user action
        break;
}

function storeGroupIds() { // Store group IDs in sessionStorage

	sessionStorage.groupsPageUrl = document.URL;

	const groupList = document.querySelectorAll("#listContainer_databody tr");

	let groupIds = [];

	for (var group of groupList) {
		groupIds.push(group.querySelector("a[href*='&group_id'").href.replace(/.+group_id=/, ""));
	}

	sessionStorage.storedGroupIds = JSON.stringify(groupIds);

	sessionStorage.groupIterationCount = 0; // Start group iteration count

	openDiscussionBoard();
}

function openDiscussionBoard() {

	// Open a group discussion board in same window/tab
	if (sessionStorage.groupIterationCount < JSON.parse(sessionStorage.storedGroupIds).length) {

		sessionStorage.lastRun = openDiscussionBoard.name;

		window.open("https://fiu.blackboard.com/webapps/discussionboard/do/conference?action=list_forums&course_id=" + course_id + "&nav=group_forum&group_id=" + JSON.parse(sessionStorage.storedGroupIds)[sessionStorage.groupIterationCount], "_self");
	}
	else {
		sessionStorage.lastRun = "done";

		alert("All Group Discussion Board Threads Were Deleted. Taking you back to the 'Groups' page.");
		
		window.open(sessionStorage.groupsPageUrl, "_self");
	}
}

function storeForumIds() {

	sessionStorage.conf_id = document.getElementById("conf_id").value;

	sessionStorage.lastRun = storeForumIds.name;

	// Get forum IDs
	const forumList = document.querySelectorAll("#listContainer_databody tr");

	let forumIds = [];

	for (var forum of forumList) {
		forumIds.push(forum.id.replace("listContainer_row:", ""));
	}

	// Store forum IDs in sessionStorage
	sessionStorage.storedForumIds = JSON.stringify(forumIds);

	sessionStorage.forumIterationCount = 0; // Start forum iteration count
	sessionStorage.groupIterationCount++;

	openForum();
}

function openForum() {

	if (sessionStorage.forumIterationCount < JSON.parse(sessionStorage.storedForumIds).length) {

		sessionStorage.lastRun = openForum.name;

		window.open("https://fiu.blackboard.com/webapps/discussionboard/do/forum?action=list_threads&nav=group_forum&group_id=" + JSON.parse(sessionStorage.storedGroupIds)[sessionStorage.groupIterationCount] + "&course_id=" + course_id + "&conf_id=" + sessionStorage.conf_id + "&forum_id=" + JSON.parse(sessionStorage.storedForumIds)[sessionStorage.forumIterationCount], "_self");
    }
        else {

		openDiscussionBoard();
	}
}

function deleteAllForumThreads() {

	if (document.getElementById("listContainer_selectAll")) {

		sessionStorage.lastRun = deleteAllForumThreads.name;

		let checkboxes = document.querySelectorAll("#listContainer_databody tr > td > input");

		for (let checkbox of checkboxes) { // Select each thread to delete
			checkbox.click();
		}

		document.forumForm.action = "forum?action=deleteThread&do=delete&requestType=thread&forum_title=&forum_id=" + JSON.parse(sessionStorage.storedForumIds)[sessionStorage.forumIterationCount] + "&group_id=" + JSON.parse(sessionStorage.storedGroupIds)[sessionStorage.groupIterationCount] + "&nav=group_forum&conf_id=" + sessionStorage.conf_id + "&course_id=" + course_id;

		sessionStorage.forumIterationCount++;

		document.forumForm.submit();
	}
	else {

		sessionStorage.forumIterationCount++;

		openForum();
	}
}
})();
