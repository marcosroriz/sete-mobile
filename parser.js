// Varias funções de parse
module.exports.aluno = function (alunoRaw) {
    var alunoJSON = Object.assign({}, alunoRaw);
    alunoJSON["ESCOLA"] = "Sem escola cadastrada";
    alunoJSON["ROTA"] = "Sem rota cadastrada";
    alunoJSON["ID_ESCOLA"] = 0;

    switch (alunoRaw["MEC_TP_LOCALIZACAO"]) {
        case 1:
            alunoJSON["LOCALIZACAO"] = "Urbana";
            break;
        case 2:
            alunoJSON["LOCALIZACAO"] = "Rural";
            break;
        default:
            alunoJSON["LOCALIZACAO"] = "Urbana";
    }

    switch (alunoRaw["SEXO"]) {
        case 1:
            alunoJSON["SEXOSTR"] = "Masculino";
            break;
        case 2:
            alunoJSON["SEXOSTR"] = "Feminino";
            break;
        default:
            alunoJSON["SEXOSTR"] = "Não Informado";
    }

    switch (alunoRaw["COR"]) {
        case 1:
            alunoJSON["CORSTR"] = "Amarelo";
            break;
        case 2:
            alunoJSON["CORSTR"] = "Branco";
            break;
        case 3:
            alunoJSON["CORSTR"] = "Indígena";
            break;
        case 4:
            alunoJSON["CORSTR"] = "Pardo";
            break;
        case 5:
            alunoJSON["CORSTR"] = "Preto";
            break;
        default:
            alunoJSON["CORSTR"] = "Não informado";
            break;
    }

    switch (alunoRaw["GRAU_RESPONSAVEL"]) {
        case 0:
            alunoJSON["GRAUSTR"] = "Pai, Mãe, Padrasto ou Madrasta";
            break;
        case 1:
            alunoJSON["GRAUSTR"] = "Avô ou Avó";
            break;
        case 2:
            alunoJSON["GRAUSTR"] = "Irmão ou Irmã";
            break;
        case 3:
            alunoJSON["GRAUSTR"] = "Outro Parente";
            break;
        case 4:
            alunoJSON["GRAUSTR"] = "Outro Parente";
            break;
        default:
            alunoJSON["GRAUSTR"] = "Não informado";
            break;
    }

    switch (alunoRaw["TURNO"]) {
        case 1:
            alunoJSON["TURNOSTR"] = "Manhã";
            break;
        case 2:
            alunoJSON["TURNOSTR"] = "Tarde";
            break;
        case 3:
            alunoJSON["TURNOSTR"] = "Integral";
            break;
        case 4:
            alunoJSON["TURNOSTR"] = "Noturno";
            break;
        default:
            alunoJSON["TURNOSTR"] = "Manhã";
    }

    switch (alunoRaw["NIVEL"]) {
        case 1:
            alunoJSON["NIVELSTR"] = "Infantil (Creche)";
            break;
        case 2:
            alunoJSON["NIVELSTR"] = "Fundamental";
            break;
        case 3:
            alunoJSON["NIVELSTR"] = "Médio";
            break;
        case 4:
            alunoJSON["NIVELSTR"] = "Superior";
            break;
        case 5:
            alunoJSON["NIVELSTR"] = "Outro";
            break;
        default:
            alunoJSON["NIVELSTR"] = "Fundamental";
    }

    return alunoJSON;
};

module.exports.escola = function (escolaRaw) {
    var escolaJSON = Object.assign({}, escolaRaw);
    escolaJSON["NOME"] = escolaJSON["NOME"];
    switch (escolaRaw["MEC_TP_LOCALIZACAO"]) {
        case 1:
            escolaJSON["LOCALIZACAO"] = "Urbana";
            break;
        case 2:
            escolaJSON["LOCALIZACAO"] = "Rural";
            break;
        default:
            escolaJSON["LOCALIZACAO"] = "Urbana";
    }

    switch (escolaRaw["TP_DEPENDENCIA"]) {
        case 1:
            escolaJSON["DEPENDENCIA"] = "Federal";
            break;
        case 2:
            escolaJSON["DEPENDENCIA"] = "Estadual";
            break;
        case 3:
            escolaJSON["DEPENDENCIA"] = "Municipal";
            break;
        case 4:
            escolaJSON["DEPENDENCIA"] = "Privada";
            break;
        default:
            escolaJSON["DEPENDENCIA"] = "Municipal";
    }

    var tipoEnsino = new Array();
    if (escolaRaw["ENSINO_FUNDAMENTAL"]) tipoEnsino.push("Fundamental");
    if (escolaRaw["ENSINO_MEDIO"]) tipoEnsino.push("Médio");
    if (escolaRaw["ENSINO_SUPERIOR"]) tipoEnsino.push("Superior");
    escolaJSON["ENSINO"] = tipoEnsino.join(", ");

    var horarioEnsino = new Array();
    if (escolaRaw["HORARIO_MATUTINO"]) horarioEnsino.push("Manhã");
    if (escolaRaw["HORARIO_NOTURNO"]) horarioEnsino.push("Tarde");
    if (escolaRaw["HORARIO_VESPERTINO"]) horarioEnsino.push("Noite");
    escolaJSON["HORARIO"] = horarioEnsino.join(", ");

    var regimeEnsino = new Array();
    if (escolaRaw["MEC_IN_REGULAR"]) regimeEnsino.push("Regular");
    if (escolaRaw["MEC_IN_EJA"]) regimeEnsino.push("EJA");
    if (escolaRaw["MEC_IN_PROFISSIONALIZANTE"]) regimeEnsino.push("Profissionalizante");
    escolaJSON["REGIME"] = regimeEnsino.join(", ");


    escolaJSON["NUM_ALUNOS"] = 0;

    return escolaJSON;
};

module.exports.motorista = function (motoristaRaw) {
    var motoristaJSON = Object.assign({}, motoristaRaw);
    motoristaJSON["ROTAS"] = 0;

    var categorias = new Array();
    if (motoristaRaw["TEM_CNH_A"]) categorias.push("A");
    if (motoristaRaw["TEM_CNH_B"]) categorias.push("B");
    if (motoristaRaw["TEM_CNH_C"]) categorias.push("C");
    if (motoristaRaw["TEM_CNH_D"]) categorias.push("D");
    if (motoristaRaw["TEM_CNH_E"]) categorias.push("E");
    motoristaJSON["CATEGORIAS"] = categorias.join(", ");

    var turno = new Array();
    if (motoristaRaw["TURNO_MANHA"]) turno.push("Manhã");
    if (motoristaRaw["TURNO_TARDE"]) turno.push("Tarde");
    if (motoristaRaw["TURNO_NOITE"]) turno.push("Noite");
    motoristaJSON["TURNOSTR"] = turno.join(", ");

    return motoristaJSON;
};

module.exports.rota = function (rotaRaw) {
    var rotaJSON = Object.assign({}, rotaRaw);
    rotaJSON["ROTAS"] = 0;

    if (rotaRaw["KM"] == 0) {
        rotaJSON["KMSTR"] = "Não informado";
    } else {
        rotaJSON["KMSTR"] = rotaRaw["KM"] + " km";
    }
    var turno = new Array();
    if (rotaRaw["TURNO_MATUTINO"]) turno.push("Manhã");
    if (rotaRaw["TURNO_VESPERTINO"]) turno.push("Tarde");
    if (rotaRaw["TURNO_NOTURNO"]) turno.push("Noite");
    rotaJSON["TURNOSTR"] = turno.join(", ");


    var dificuldadesAcesso = new Array();
    if (rotaRaw["DA_PORTEIRA"]) { dificuldadesAcesso.push("Porteira"); }
    if (rotaRaw["DA_MATABURRO"]) { dificuldadesAcesso.push("Mata-Burro"); }
    if (rotaRaw["DA_COLCHETE"]) { dificuldadesAcesso.push("Colchete"); }
    if (rotaRaw["DA_ATOLEIRO"]) { dificuldadesAcesso.push("Atoleiro"); }
    if (rotaRaw["DA_PONTERUSTICA"]) { dificuldadesAcesso.push("Ponte Rústica"); }
    rotaJSON["DIFICULDADESTR"] = dificuldadesAcesso.join(", ");

    return rotaJSON;
};

module.exports.veiculo = function (veiculoRaw) {
    var veiculoJSON = Object.assign({}, veiculoRaw);
    veiculoJSON["CAPACIDADE_ATUAL"] = 0;

    if (veiculoJSON["MANUTENCAO"]) {
        veiculoJSON["ESTADO"] = "Manutenção";
    } else {
        veiculoJSON["ESTADO"] = "Operação";
    }

    if (veiculoJSON["ORIGEM"] == "1") {
        veiculoJSON["ORIGEMSTR"] = "Frota própria";
    } else {
        veiculoJSON["ORIGEMSTR"] = "Frota terceirizadas";
    }

    switch (veiculoRaw["TIPO"]) {
        case 1: veiculoJSON["TIPOSTR"] = "Ônibus"; break;
        case 2: veiculoJSON["TIPOSTR"] = "Micro-ônibus"; break;
        case 3: veiculoJSON["TIPOSTR"] = "Van"; break;
        case 4: veiculoJSON["TIPOSTR"] = "Kombi"; break;
        case 5: veiculoJSON["TIPOSTR"] = "Caminhão"; break;
        case 6: veiculoJSON["TIPOSTR"] = "Caminhonete"; break;
        case 7: veiculoJSON["TIPOSTR"] = "Motocicleta"; break;
        case 8: veiculoJSON["TIPOSTR"] = "Animal de tração"; break;
        case 9: veiculoJSON["TIPOSTR"] = "Lancha/Voadeira"; break;
        case 10: veiculoJSON["TIPOSTR"] = "Barco de madeira"; break;
        case 11: veiculoJSON["TIPOSTR"] = "Barco de alumínio"; break;
        case 12: veiculoJSON["TIPOSTR"] = "Canoa motorizada"; break;
        case 13: veiculoJSON["TIPOSTR"] = "Canoa a remo"; break;
        default: veiculoJSON["TIPOSTR"] = "Ônibus";
    }

    switch (parseInt(veiculoRaw["MARCA"])) {
        case 1: veiculoJSON["MARCASTR"] = "IVECO"; break;
        case 2: veiculoJSON["MARCASTR"] = "MERCEDES-BENZ"; break;
        case 3: veiculoJSON["MARCASTR"] = "VOLKSWAGEN"; break;
        case 4: veiculoJSON["MARCASTR"] = "VOLARE"; break;
        case 5: veiculoJSON["MARCASTR"] = "OUTRA"; break;
        default: veiculoJSON["MARCASTR"] = "OUTRA";
    }

    switch (parseInt(veiculoRaw["MODELO"])) {
        case 1: veiculoJSON["MODELOSTR"] = "ORE 1"; break;
        case 2: veiculoJSON["MODELOSTR"] = "ORE 1 (4x4)"; break;
        case 3: veiculoJSON["MODELOSTR"] = "ORE 2"; break;
        case 4: veiculoJSON["MODELOSTR"] = "ORE 3"; break;
        case 5: veiculoJSON["MODELOSTR"] = "ORE 4"; break;
        case 6: veiculoJSON["MODELOSTR"] = "ONUREA"; break;
        case 7: veiculoJSON["MODELOSTR"] = "Lancha a Gasolina"; break;
        case 8: veiculoJSON["MODELOSTR"] = "Lancha a Diesel"; break;
        default: veiculoJSON["MODELOSTR"] = "Não se aplica";
    }

    return veiculoJSON;
};

module.exports.fornecedor = function (fornecedorRaw) {
    var fornecedorJSON = Object.assign({}, fornecedorRaw);

    var servicos = new Array();
    if (fornecedorRaw["RAMO_MECANICA"]) servicos.push("Mecânica");
    if (fornecedorRaw["RAMO_COMBUSTIVEL"]) servicos.push("Combustível");
    if (fornecedorRaw["RAMO_SEGURO"]) servicos.push("Seguros");
    fornecedorJSON["SERVICOSTR"] = servicos.join(", ");

    return fornecedorJSON;
};

module.exports.os = function (osRaw) {
    var osJSON = Object.assign({}, osRaw);
    if (osJSON["TERMINO"]) {
        osJSON["TERMINOSTR"] = "Sim";
    } else {
        osJSON["TERMINOSTR"] = "Não";
    }

    switch (osRaw["TIPO_SERVICO"]) {
        case 1: osJSON["TIPOSTR"] = "Combustível"; break;
        case 2: osJSON["TIPOSTR"] = "Óleo e lubrificantes"; break;
        case 3: osJSON["TIPOSTR"] = "Seguro"; break;
        case 4: osJSON["TIPOSTR"] = "Manutenção Preventiva"; break;
        case 5: osJSON["TIPOSTR"] = "Manutenção"; break;
        default: osJSON["TIPOSTR"] = "Combustível";
    }

    return osJSON;
}