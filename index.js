const Gitlab = require("gitlab").Gitlab;
const axios = require("axios");

let host = process.env.GITLAB_HOST;
const api = new Gitlab({
	host: host,
	token: process.env.GITLAB_TOKEN
});

const removeTags = project => {
	return registry => {
		axios
			.delete(
				`${host}/api/v4/projects/${project.id}/registry/repositories/${registry.id}/tags?keep_n=5&name_regex=${decodeURI(".*")}`,
				{
					headers: {
						"PRIVATE-TOKEN": process.env.GITLAB_TOKEN
					}
				}
			)
			.then(result => console.log(`Deleted tags in registry '${registry.id}' for project '${project.name}'`))
			.catch(err => console.log(`Can't delete tags in registry '${registry.id}' for project '${project.name}'`));
	};
};

const getRegistries = (project, doWithRegistry) => {
	api
		.ContainerRegistry
		.repositories(project.id)
		.then(registries => registries.forEach(doWithRegistry))
		.catch(err => console.log(`Can't access registries for project '${project.name}'`));
};

const getProjects = function (doWithProject) {
	api
		.Projects
		.all()
		.then(projects => projects.forEach(project => doWithProject(project)))
		.catch(err => console.log(err));
};

getProjects(project => getRegistries(project, removeTags(project)));
