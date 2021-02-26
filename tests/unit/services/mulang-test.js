import QUnit, { module, test } from 'qunit'
import { setupTest } from 'ember-qunit'
import { blocklyWorkspaceMock } from '../../helpers/mocks'

let pilasMulang = null

module('Unit | Service | pilas-mulang', function (hooks) {
  setupTest(hooks)

  hooks.beforeEach(function () {
    QUnit.dump.maxDepth = 10 // For deepEqual assertion
    blocklyWorkspaceMock()
    this.owner.lookup('service:blocksGallery').start()
    pilasMulang = this.owner.lookup('service:pilas-mulang')
  })

  let emptyProgram = `
  <block type="al_empezar_a_ejecutar">
    <statement name="program">
      <shadow type="required_statement"></shadow>
    </statement>
  </block>
  `
  mulangTest('emptyProgram', emptyProgram,
    entryPoint(
      "al_empezar_a_ejecutar"
    )
  )

  let simpleProgram = `
  <block type="al_empezar_a_ejecutar">
    <statement name="program">
      <shadow type="required_statement"></shadow>
      <block type="MoverACasillaDerecha"></block>
    </statement>
  </block>
  `
  let simpleProgramAST =
    entryPoint(
      "al_empezar_a_ejecutar",
      application("MoverACasillaDerecha")
    )
  mulangTest('simpleProgram', simpleProgram, simpleProgramAST)

  let al_empezar_a_ejecutar = `
  <block type="al_empezar_a_ejecutar">
    <statement name="program">
      <shadow type="required_statement"></shadow>
      <block type="MoverACasillaDerecha">
        <next>
          <block type="MoverACasillaIzquierda">
            <next>
              <block type="MoverACasillaDerecha"></block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
  `
  mulangTest('al_empezar_a_ejecutar', al_empezar_a_ejecutar,
    entryPoint(
      "al_empezar_a_ejecutar",
      application("MoverACasillaDerecha"),
      application("MoverACasillaIzquierda"),
      application("MoverACasillaDerecha")
    )
  )

  let repetir = `
  <block type="repetir">
    <value name="count">
      <block type="math_number">
        <field name="NUM">10</field>
      </block>
    </value>
    <statement name="block">
      <block type="MoverACasillaIzquierda">
        <next>
          <block type="MoverACasillaDerecha"></block>
        </next>
      </block>
    </statement>
  </block>
  `
  mulangTest('repetir', repetir,
    repeat(
      number(10),
      application("MoverACasillaIzquierda"),
      application("MoverACasillaDerecha")
    )
  )

  let si = `
  <block type="Si">
    <value name="condition">
      <block type="HayChurrasco"></block>
    </value>
    <statement name="block">
      <block type="MoverACasillaDerecha">
        <next>
          <block type="ComerChurrasco"></block>
        </next>
      </block>
    </statement>
  </block>
  `
  mulangTest('si', si,
    muIf(
      application("HayChurrasco"),
      application("MoverACasillaDerecha"),
      application("ComerChurrasco")
    )
  )

  let sino = `
  <block type="SiNo">
    <value name="condition">
      <shadow type="required_value"></shadow>
      <block type="HayTomate"></block>
    </value>
    <statement name="block1">
      <shadow type="required_statement"></shadow>
      <block type="AgarrarTomate">
        <next>
          <block type="MoverACasillaIzquierda"></block>
        </next>
      </block>
    </statement>
    <statement name="block2">
      <shadow type="required_statement"></shadow>
      <block type="AgarrarLechuga">
        <next>
          <block type="MoverACasillaIzquierda"></block>
        </next>
      </block>
    </statement>
  </block>
  `
  mulangTest('sino', sino,
    ifElse(
      application("HayTomate"),
      sequence(
        application("AgarrarTomate"),
        application("MoverACasillaIzquierda")
      ),
      sequence(
        application("AgarrarLechuga"),
        application("MoverACasillaIzquierda")
      )
    )
  )

  let hasta = `
  <block type="Hasta">
    <value name="condition">
      <shadow type="required_value"></shadow>
      <block type="TocandoFinal"></block>
    </value>
    <statement name="block">
      <shadow type="required_statement"></shadow>
      <block type="EncenderLuz">
        <next>
          <block type="MoverACasillaAbajo"></block>
        </next>
      </block>
    </statement>
  </block>
  `
  mulangTest('hasta', hasta,
    muWhile(
      application("TocandoFinal"),
      application("EncenderLuz"),
      application("MoverACasillaAbajo")
    )
  )

  let applicationWithParameter = `
  <block type="MoverA">
    <value name="direccion">
      <shadow type="required_value"></shadow>
      <block type="ParaLaDerecha"></block>
    </value>
  </block>
  `
  mulangTest('application with reference param', applicationWithParameter,
    application("MoverA", reference("ParaLaDerecha"))
  )

  let applicationWithApplicationParameter = `
  <block type="DibujarLado">
    <value name="longitud">
      <shadow type="required_value"></shadow>
      <block type="OpAritmetica">
        <field name="OP">ADD</field>
        <value name="A">
          <shadow type="required_value"></shadow>
          <block type="math_number">
            <field name="NUM">10</field>
          </block>
        </value>
        <value name="B">
          <shadow type="required_value"></shadow>
          <block type="math_number">
            <field name="NUM">100</field>
          </block>
        </value>
      </block>
    </value>
  </block>
  `
  mulangTest('application with application param', applicationWithApplicationParameter,
    application("DibujarLado",
      application("ADD",
        number(10),
        number(100)
      )
    )
  )

  let applicationWithTextParameter = `
  <block type="EscribirTextoDadoEnOtraCuadricula">
    <field name="texto">A</field>
  </block>
  `
  mulangTest('application with text param', applicationWithTextParameter,
    application("EscribirTextoDadoEnOtraCuadricula", string("A"))
  )

  let operator = `
  <block type="Si">
    <value name="condition">
      <shadow type="required_value"></shadow>
      <block type="OpComparacion">
        <field name="OP">EQ</field>
        <value name="A">
          <shadow type="required_value"></shadow>
          <block type="Numero">
            <field name="NUM">0</field>
          </block>
        </value>
        <value name="B">
          <shadow type="required_value"></shadow>
          <block type="Numero">
            <field name="NUM">0</field>
          </block>
        </value>
      </block>
    </value>
    <statement name="block">
      <shadow type="required_statement"></shadow>
      <block type="MoverACasillaDerecha">
        <next>
          <block type="PrenderFogata"></block>
        </next>
      </block>
    </statement>
  </block>
  `
  mulangTest('operator', operator,
    muIf(
      application("EQ",
        number(0),
        number(0)
      ),
      application("MoverACasillaDerecha"),
      application("PrenderFogata")
    )
  )


  let procedureDefinition = `
  <block type="procedures_defnoreturn">
    <field name="NAME">esquina</field>
    <statement name="STACK">
      <shadow type="required_statement"></shadow>
      <block type="DibujarLado">
        <value name="longitud">
          <shadow type="required_value"></shadow>
          <block type="math_number">
            <field name="NUM">100</field>
          </block>
        </value>
        <next>
          <block type="GirarGrados">
            <value name="grados">
              <shadow type="required_value"></shadow>
              <block type="math_number">
                <field name="NUM">90</field>
              </block>
            </value>
            <next>
              <block type="DibujarLado">
                <value name="longitud">
                  <shadow type="required_value"></shadow>
                  <block type="math_number">
                    <field name="NUM">100</field>
                  </block>
                </value>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
  `
  let procedureAST =
    procedure("esquina", [],
      application("DibujarLado", number(100)),
      application("GirarGrados", number(90)),
      application("DibujarLado", number(100))
    )
  mulangTest('procedure', procedureDefinition, procedureAST)

  let procedureWithParams = `
  <block type="procedures_defnoreturn">
    <mutation>
      <arg name="lado"></arg>
      <arg name="angulo"></arg>
    </mutation>
    <field name="NAME">esquina</field>
    <field name="ARG0">lado</field>
    <field name="ARG1">angulo</field>
    <statement name="STACK">
      <shadow type="required_statement"></shadow>
      <block type="DibujarLado">
        <value name="longitud">
          <shadow type="required_value"></shadow>
          <block type="variables_get">
            <mutation var="lado" parent=":2hb{1CYnYqL(S0v_ou"></mutation>
          </block>
        </value>
        <next>
          <block type="GirarGrados">
            <value name="grados">
              <shadow type="required_value"></shadow>
              <block type="variables_get">
                <mutation var="angulo" parent=":2hb{1CYnYqL(S0v_ou"></mutation>
              </block>
            </value>
            <next>
              <block type="DibujarLado">
                <value name="longitud">
                  <shadow type="required_value"></shadow>
                  <block type="variables_get">
                    <mutation var="lado" parent=":2hb{1CYnYqL(S0v_ou"></mutation>
                  </block>
                </value>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
  `
  mulangTest('procedure with params', procedureWithParams,
    procedure("esquina", ["lado", "angulo"],
      application("DibujarLado", reference("lado")),
      application("GirarGrados", reference("angulo")),
      application("DibujarLado", reference("lado"))
    )
  )

  let procedureCall = `
  <block type="procedures_callnoreturn">
    <mutation name="Hacer algo"></mutation>
  </block>
  `
  mulangTest('procedureCall', procedureCall,
    application("Hacer algo")
  )

  let procedureCallWithParam = `
  <block type="procedures_callnoreturn" disabled="true">
    <mutation name="Hacer algo2">
      <arg name="parámetro 1"></arg>
    </mutation>
    <value name="ARG0">
      <shadow type="required_value"></shadow>
      <block type="math_number">
        <field name="NUM">90</field>
      </block>
    </value>
  </block>
  `
  mulangTest('procedureCallWithParam', procedureCallWithParam,
    application("Hacer algo2", number(90))
  )

  let parameter = `
  <block type="GirarGrados">
    <value name="grados">
      <shadow type="required_value"></shadow>
      <block type="variables_get">
        <mutation var="angulo" parent=":2hb{1CYnYqL(S0v_ou"></mutation>
      </block>
    </value>
  </block>
  `
  mulangTest('parameter', parameter,
    application("GirarGrados",
      reference("angulo")
    )
  )

  test(`Should parse every blocks on workspace`, function (assert) {
    Blockly.textToBlock(simpleProgram)
    Blockly.textToBlock(procedureDefinition)
    let ast = pilasMulang.parseAll(Blockly.mainWorkspace)
    assert.deepEqual(ast, [simpleProgramAST, procedureAST])
  })

  let evilSolution = [`
  <block type="al_empezar_a_ejecutar" deletable="false" movable="false" editable="false" x="15" y="15">
    <statement name="program">
      <shadow type="required_statement"></shadow>
      <block type="repetir">
        <value name="count">
          <shadow type="required_value"></shadow>
          <block type="OpAritmetica">
            <field name="OP">ADD</field>
            <value name="A">
              <shadow type="required_value"></shadow>
              <block type="math_number">
                <field name="NUM">10</field>
              </block>
            </value>
            <value name="B">
              <shadow type="required_value"></shadow>
            </value>
          </block>
        </value>
        <statement name="block">
          <shadow type="required_statement"></shadow>
        </statement>
        <next>
          <block type="procedures_callnoreturn">
            <mutation name="Hacer algo2"></mutation>
          </block>
        </next>
      </block>
    </statement>
  </block>
  `, `
  <block type="procedures_defnoreturn" x="385" y="21">
    <mutation>
      <arg name="parámetro 1"></arg>
    </mutation>
    <field name="NAME">Hacer algo</field>
    <field name="ARG0">parámetro 1</field>
    <statement name="STACK">
      <block type="DibujarLado">
        <value name="longitud">
          <shadow type="required_value"></shadow>
        </value>
        <next>
          <block type="procedures_callnoreturn">
            <mutation name="Hacer algo">
              <arg name="parámetro 1"></arg>
            </mutation>
            <value name="ARG0">
              <shadow type="required_value"></shadow>
            </value>
          </block>
        </next>
      </block>
    </statement>
  </block>
  `, `
  <block type="procedures_defnoreturn" x="709" y="10">
    <field name="NAME">Hacer algo2</field>
    <statement name="STACK">
      <block type="GirarGrados">
        <value name="grados">
          <shadow type="required_value"></shadow>
          <block type="variables_get" disabled="true">
            <mutation var="parámetro 1" parent="hZ6TYHUC~Lmbq+5encV["></mutation>
          </block>
        </value>
        <next>
          <block type="SiNo" disabled="true" x="394" y="141">
            <value name="condition">
              <shadow type="required_value"></shadow>
            </value>
            <statement name="block1">
              <shadow type="required_statement"></shadow>
            </statement>
            <statement name="block2">
              <shadow type="required_statement"></shadow>
            </statement>
          </block>
        </next>
      </block>
    </statement>
  </block>
  `, `
  <block type="variables_get" disabled="true" x="358" y="216">
    <mutation var="parámetro 1" parent="hZ6TYHUC~Lmbq+5encV["></mutation>
  </block>
  `, `
  <block type="math_number" disabled="true" x="609" y="218">
    <field name="NUM">100</field>
  </block>
  `, `
  <block type="SaltarHaciaAdelante" disabled="true" x="156" y="292">
    <value name="longitud">
      <shadow type="required_value"></shadow>
    </value>
  </block>
  `]
  test(`Should parse workspace with errors`, function (assert) {
    evilSolution.forEach(Blockly.textToBlock)
    let ast = pilasMulang.parseAll(Blockly.mainWorkspace)
    assert.deepEqual(ast, [
      entryPoint('al_empezar_a_ejecutar',
        repeat(application('ADD', number(10), none()), none()),
        application('Hacer algo2')
      ),
      procedure('Hacer algo', ['parámetro 1'],
        application('DibujarLado', none()),
        application('Hacer algo', none())
      ),
      procedure('Hacer algo2', [],
        application('GirarGrados', reference('parámetro 1')),
        ifElse(none(), none(), none())
      ),
      reference('parámetro 1'),
      number(100),
      application('SaltarHaciaAdelante', none())
    ])
  })
})


function mulangTest(name, code, mulangAst) {
  test(`Should parse ${name}`, function (assert) {
    let ast = pilasMulang.parse(Blockly.textToBlock(code))
    assert.deepEqual(ast, mulangAst)
  })
}


// TODO: Move to helpers
// Builders
function procedure(name, params, ...seq) {
  return {
    tag: "Procedure",
    contents: [
      name,
      [
        equation(params, ...seq)
      ]
    ]
  }
}

function equation(params, ...seq) {
  return [
    params.map(name => variable(name)),
    body(...seq)
  ]
}

function variable(name) {
  return {
    tag: "VariablePattern",
    contents: name
  }
}

function body(...seq) {
  return {
    tag: "UnguardedBody",
    contents: sequence(...seq)
  }
}


function entryPoint(name, ...seq) {
  return {
    tag: "EntryPoint",
    contents: [
      name,
      sequence(...seq)
    ]
  }
}

function sequence(...seq) {
  if (seq.length == 0) return none()
  if (seq.length == 1) return seq[0]
  return {
    tag: "Sequence",
    contents: seq
  }
}

function reference(name) {
  return {
    tag: "Reference",
    contents: name
  }
}

function application(name, ...params) {
  return {
    tag: "Application",
    contents: [
      reference(name),
      params
    ]
  }
}

function repeat(count, ...seq) {
  return {
    tag: "Repeat",
    contents: [
      count,
      sequence(...seq)
    ]
  }
}

function muIf(condition, ...seq) {
  return {
    tag: "If",
    contents: [
      condition,
      sequence(...seq),
      none()
    ]
  }
}

function ifElse(condition, seqTrue, seqFalse) {
  return {
    tag: "If",
    contents: [
      condition,
      seqTrue,
      seqFalse
    ]
  }
}

function muWhile(condition, ...seq) {
  return {
    tag: "While",
    contents: [
      condition,
      sequence(...seq)
    ]
  }
}

function number(n) {
  return {
    tag: "MuNumber",
    contents: n
  }
}

function string(s) {
  return {
    tag: "MuString",
    contents: s
  }
}

function none() {
  return {
    tag: "None",
    contents: []
  }
}