import { Importance, Transformer, parse_args, to_lisp_args } from './main.js'

export const def: Transformer = {
	importance: Importance.Anywhere,
	fn: (s: string, state, arg) => {
		
		const references = s.match(/(?<={{)[^}]+(?=}})/)?.map(x => x.trim()).filter(v => !state.variables.includes(v)) ?? ''

		return `(defwidget ${arg.name} [${references}] ${s})`
	}
}

export const script_var: Transformer = {
	importance: Importance.Anywhere,
	fn: (s: string, state, arg) => {
		let tag = 'defpoll' // do this more smarter.. maybe -- im tempted to not care
		return `(${tag} ${to_lisp_args(arg)} ${s})`
	}
}

export const window: Transformer = {
	importance: Importance.Anywhere,
	fn: (s: string, state, arg) => {
		
		const geometry = /<geometry/.test(s) ? to_lisp_args(parse_args(s.match(/(?<=<geometry).*(?=\/>)/)![0]!)) : '' // chaining functions.. my favourite thing ever
		const reserve = (() => {
			if (/<reserve/.test(s)) {
			const reserve_args = parse_args(s.match(/(?<=<reserve).*(?=\/>)/)![0]!)
			delete reserve_args['layer']
			return to_lisp_args(reserve_args)
			} return ''
		})()
		s = s.replace(/<(geometry|reserve).*\/>/g, '')

		return `(defwindow ${to_lisp_args(arg)}
						${geometry.length > 0 ? `:geometry (geometry ${geometry})` : ''}
						${reserve.length > 0 ? `:reserve (struts ${reserve})` : '' } ${s})`
	}
}
